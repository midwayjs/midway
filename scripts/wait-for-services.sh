#!/bin/bash

set -e
set -o pipefail

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_service() {
    local service_name=$1
    local check_command=$2
    local max_attempts=${3:-60}
    local sleep_interval=${4:-2}
    log_info "检查 $service_name 服务状态..."
    for i in $(seq 1 $max_attempts); do
        if eval "$check_command" > /dev/null 2>&1; then
            log_info "$service_name 服务已就绪"
            return 0
        fi
        if [ $i -lt $max_attempts ]; then
            log_warn "等待 $service_name 服务启动... (尝试 $i/$max_attempts)"
            sleep $sleep_interval
        fi
    done
    log_error "$service_name 服务在指定时间内未启动"
    exit 1
}

get_container_id() {
    local service_name=$1
    for i in {1..10}; do
        cid=$(docker compose -f docker-compose.ci.yml ps -q $service_name)
        if [ -n "$cid" ]; then
            echo $cid
            return 0
        fi
        sleep 1
    done
    return 1
}

main() {
    log_info "开始检查所有服务状态..."
    log_info "当前容器状态："
    docker compose -f docker-compose.ci.yml ps
    log_info "等待容器初始化..."
    sleep 20

    check_service "Redis" "docker exec \$(get_container_id redis) redis-cli ping | grep -q 'PONG'"
    check_service "RabbitMQ" "curl -u guest:guest -f http://localhost:15672/api/overview"
    check_service "Zookeeper" "echo 'mntr' | nc -w 2 -q 2 localhost 2181 | grep -q 'zk_version'"
    check_service "Kafka" "nc -z localhost 9092"
    check_service "etcd-port" "nc -z localhost 2379"

    # 检查 etcd 健康，失败时打印日志
    if ! check_service "etcd" "curl -sf http://localhost:2379/health | grep -q '\"health\":\"true\"'"; then
        log_error "etcd 健康检查失败，打印 etcd 容器日志："
        docker logs Etcd-server || true
        log_error "etcd 健康接口返回内容："
        curl -v http://localhost:2379/health || true
        exit 1
    fi

    check_service "MongoDB" "nc -z localhost 27017"
    check_service "Mosquitto" "nc -z localhost 1883"

    log_info "所有服务检查完成！"
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 