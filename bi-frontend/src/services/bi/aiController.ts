// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** tallQuestion POST /api/AI/test2 */
export async function tallQuestionUsingPost(body: string, options?: { [key: string]: any }) {
  return request<string>('/api/AI/test2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
