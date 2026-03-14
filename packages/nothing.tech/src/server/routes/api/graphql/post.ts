import {
	graphql,
	GraphQLObjectType,
	GraphQLSchema,
	GraphQLString,
} from 'graphql';
import { IncomingMessage, ServerResponse } from 'node:http';
import { getRequestBody } from '../../../../utils/server';
import { tryCatch } from '../../../../utils/try-catch';

// Define schema
const schema = new GraphQLSchema({
	query: new GraphQLObjectType({
		name: 'RootQueryType',
		fields: {
			hello: {
				type: GraphQLString,
				resolve() {
					return 'world';
				},
			},
		},
	}),
});

export const postRoute = async (
	request: IncomingMessage,
	response: ServerResponse<IncomingMessage> & {
		req: IncomingMessage;
	},
) => {
	const { data: body = {} } = await tryCatch(getRequestBody(request));
	const { query: source } = body as { query: string };
	const data = await graphql({ schema, source });
	response.writeHead(200, { 'Content-Type': 'application/json' });
	response.end(JSON.stringify({ error: null, data }));
};
