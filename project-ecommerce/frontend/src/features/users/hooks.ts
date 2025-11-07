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

const usersKey = (q?: UserQuery) => [
  'users',
  q?.page ?? 1,
  q?.limit ?? 12,
  q?.search ?? '',
];
const userKey = (id: number | string) => ['user', id];

export function useUsers(query: UserQuery) {
  return useQuery<Paged<User>>({
    queryKey: usersKey(query),
    queryFn: () => listUsers(query),
    keepPreviousData: true,
  });
}

export function useUser(id?: string | number) {
  return useQuery<User>({
    enabled: !!id,
    queryKey: id ? userKey(id) : ['user', 'none'],
    queryFn: () => getUser(id!),
  });
}

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
