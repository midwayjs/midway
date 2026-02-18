<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMidwayApiOperation } from '@midwayjs/vue';

type User = {
  id: string;
  name: string;
};

const user = ref<User | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const callGetUser = useMidwayApiOperation<{
  params: { id: string };
}, User>('user.getUser');

const loadUser = async () => {
  loading.value = true;
  error.value = null;
  try {
    const data = await callGetUser({
      params: { id: 'u-1' },
    });
    user.value = data;
  } catch (err: any) {
    error.value = err?.message || String(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void loadUser();
});
</script>

<template>
  <main style="font-family: sans-serif; padding: 24px; line-height: 1.5">
    <h1>Midway Functional API + Vue Sample</h1>
    <p>
      This page imports API definitions from
      <code>src/server/api</code>
      and calls them with
      <code>createClient</code>.
    </p>

    <section style="margin-top: 16px">
      <div style="margin-bottom: 12px">
        <button @click="loadUser" :disabled="loading">
          {{ loading ? 'Loading...' : 'Reload User' }}
        </button>
      </div>

      <div>
        <strong>Current User:</strong>
        {{ user ? `${user.name} (${user.id})` : 'No user loaded' }}
      </div>

      <div v-if="error" style="margin-top: 8px; color: crimson">
        <strong>Request Error:</strong>
        {{ error }}
      </div>

      <p style="margin-top: 12px; color: #666">
        If backend routes are not running yet, you should still see this page
        with an error message instead of a blank screen.
      </p>
    </section>
  </main>
</template>
