"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const decorator_1 = require("@midwayjs/decorator");
let BookService = class BookService {
    async getBook(id) {
        const books = [
            {
                id: 1,
                name: '小森林',
                ISBN: '9787541089329',
                desc: '《小森林》是知名漫画家五十岚大介的经典作品，也是豆瓣高分电影《小森林》原著，讲述一位平凡女孩在田园生活中寻找自我的故事。'
            },
            {
                id: 2,
                name: '这辈子',
                ISBN: '9787541156700',
                desc: '人活百年，看到的世界有何不同？本书是由一位百岁老人口述自己经历、孙女加以记录编纂的故事集。'
            },
            {
                id: 3,
                name: '赤朽叶家的传说',
                ISBN: '9787532175505',
                desc: '一边是山野神隐中的八岐大蛇、千里眼、野貉父子、财神惠比寿； 一边是泡沫经济下的暴走女郎、尼特族、热血漫画、超自然热潮！'
            }
        ];
        if (id) {
            return books.filter(book => {
                return book.id === id;
            });
        }
        return books;
    }
};
BookService = __decorate([
    decorator_1.Provide()
], BookService);
exports.BookService = BookService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9va1NlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZS9ib29rU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLG1EQUE4QztBQUc5QyxJQUFhLFdBQVcsR0FBeEIsTUFBYSxXQUFXO0lBRXRCLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBVztRQUV2QixNQUFNLEtBQUssR0FBRztZQUNaO2dCQUNFLEVBQUUsRUFBRSxDQUFDO2dCQUNMLElBQUksRUFBRSxLQUFLO2dCQUNYLElBQUksRUFBRSxlQUFlO2dCQUNyQixJQUFJLEVBQUUsOERBQThEO2FBQ3JFO1lBQ0Q7Z0JBQ0UsRUFBRSxFQUFFLENBQUM7Z0JBQ0wsSUFBSSxFQUFFLEtBQUs7Z0JBQ1gsSUFBSSxFQUFFLGVBQWU7Z0JBQ3JCLElBQUksRUFBRSwrQ0FBK0M7YUFDdEQ7WUFDRDtnQkFDRSxFQUFFLEVBQUUsQ0FBQztnQkFDTCxJQUFJLEVBQUUsU0FBUztnQkFDZixJQUFJLEVBQUUsZUFBZTtnQkFDckIsSUFBSSxFQUFFLDZEQUE2RDthQUNwRTtTQUNGLENBQUM7UUFFRixJQUFHLEVBQUUsRUFBRTtZQUNMLE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDekIsT0FBTyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQztZQUN4QixDQUFDLENBQUMsQ0FBQztTQUNKO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0NBQ0YsQ0FBQTtBQWpDWSxXQUFXO0lBRHZCLG1CQUFPLEVBQUU7R0FDRyxXQUFXLENBaUN2QjtBQWpDWSxrQ0FBVyJ9