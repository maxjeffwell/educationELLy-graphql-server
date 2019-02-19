// import { PubSub } from 'apollo-server';

import { RedisPubSub } from 'graphql-redis-subscriptions';

const PubSub = new RedisPubSub({
  connection: {
    host: 'ec2-54-162-83-207.compute-1.amazonaws.com',
    user: 'h',
    password: 'p439f8d1d0aff39494de90762c542b2cc2ce60a2ce40ed40358f7243a72ae3c08',
    port: 8239,
    retry_strategy: options => Math.max(options.attempt * 100, 3000),
  },
});

import * as MESSAGE_EVENTS from './message';
import * as EDITOR_EVENTS from './editor';

export const EVENTS = {
  MESSAGE: MESSAGE_EVENTS,
  EDITOR: EDITOR_EVENTS,
};

export default PubSub;
