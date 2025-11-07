import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUserApi,
  type User,
  type UserInput,
  type UserQuery,
  type Paged,
} from './api';

/* chaves de cache */
const usersKey = (q?: UserQuery) => [
  'users',
  q?.page ?? 1,
  q?.limit ?? 12,
  q?.search ?? '',
] as const;

const userKey = (id: number | string) => ['user', id] as const;

/* ---------- Queries ---------- */

export function useUsers(query: UserQuery) {
  return useQuery<Paged<User>>({
    queryKey: usersKey(query),
    queryFn: () => listUsers(query),
    keepPreviousData: true,
  });
}

/** Alias para compatibilidade com “useCustomers” mencionado antes */
export const useCustomers = useUsers;

export function useUser(id?: string | number) {
  const enabled = id !== undefined && id !== null && `${id}`.length > 0;
  return useQuery<User>({
    enabled,
    queryKey: enabled ? userKey(id as number | string) : ['user', 'none'],
    queryFn: () => getUser(id as number | string),
  });
}

/* ---------- Mutations ---------- */

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UserInput) => createUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (arg: { id: number; data: UserInput }) =>
      updateUser(arg.id, arg.data),
    onSuccess: (_res, arg) => {
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: userKey(arg.id) });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUserApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
