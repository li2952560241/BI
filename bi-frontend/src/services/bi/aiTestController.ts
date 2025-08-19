// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** tallQuestion POST /api/AI/test1 */
export async function tallQuestionUsingPost1(body: string, options?: { [key: string]: any }) {
  return request<string>('/api/AI/test1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
