import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { introspectionQuery } from 'graphql/utilities/introspectionQuery';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import 'tabler-react/dist/Tabler.css';

import { Dimmer, Page, Alert } from 'tabler-react';
import SiteWrapper from './SiteWrapper';
import Home from './Home';
import List from './List/List';
import Form from './Form/Form';
import EditForm from './EditForm';

import {
	getSchemaMainTypes,
	getSchemaInputTypes,
	getSchemaEnumTypes,
} from '../utils';

function App({ prismaEndpoint }) {
	const INTROSPECTION_QUERY = gql`
		${introspectionQuery}
	`;

	return (
		<Query query={INTROSPECTION_QUERY}>
			{({ loading, error, data }) => {
				if (loading || error) {
					return (
						<Dimmer loader active={loading}>
							<SiteWrapper prismaEndpoint={prismaEndpoint}>
								<Page.Content>
									{error && (
										<Alert type="danger">
											{error.message}
										</Alert>
									)}
								</Page.Content>
							</SiteWrapper>
						</Dimmer>
					);
				}

				const mainTypes = getSchemaMainTypes(data.__schema);
				const inputTypes = getSchemaInputTypes(data.__schema);
				const enumTypes = getSchemaEnumTypes(data.__schema);
				const navBarItems = Object.values(mainTypes).map(
					type => type.name,
				);

				return (
					<SiteWrapper
						navBarItems={navBarItems}
						prismaEndpoint={prismaEndpoint}
					>
						<Switch>
							<Route exact path="/" component={Home} />
							<Route
								exact
								path="/model/:type"
								render={props => (
									<List
										{...props}
										type={
											mainTypes[props.match.params.type]
										}
										inputTypes={inputTypes}
									/>
								)}
							/>
							<Route
								exact
								path="/model/:type/create"
								render={props => (
									<Form
										{...props}
										type={
											mainTypes[props.match.params.type]
										}
										inputTypes={inputTypes}
										enumTypes={enumTypes}
									/>
								)}
							/>
							<Route
								exact
								path="/model/:type/edit/:id/"
								render={props => (
									<EditForm
										{...props}
										type={
											mainTypes[props.match.params.type]
										}
										id={props.match.params.id}
										inputTypes={inputTypes}
										enumTypes={enumTypes}
									/>
								)}
							/>
						</Switch>
					</SiteWrapper>
				);
			}}
		</Query>
	);
}

App.propTypes = {
	prismaEndpoint: PropTypes.string.isRequired,
};

export default App;
