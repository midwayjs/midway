import { api } from '../api/client';

export async function loadUserPageData() {
  const user = await api.user.getOne({
    params: { id: 'u-1' },
  });

  return {
    title: 'User Page',
    user,
  };
}
