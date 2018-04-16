import React, { Component, createElement } from 'react';
import PropTypes from 'prop-types';

export default (state, actions) => { 
	if (typeof state === 'function' ||
			(typeof state === 'object' && Object.keys(state).length )) {
		return target => connect(state, actions, target);
	}

	return target => props => (
		<target { ...Object.assign({}, props, actions)} />
	);
}

function connect(state = () => { }, actions = {}, target) {
	class Connect extends Component {
		componentDidMount() {
			const { flux } = this.context;

			flux.FinalStore.listen(this.handleChange);
		}

		componentWillMount() {
			const { flux } = this.context;

			flux.FinalStore.unlisten(this.handleChange);
		}

		render() {
			const { flux } = this.context;
			const stores = flux.stores;
			const composedStores = composeStores(stores);

			return createElement(target,
				Object.assign(
					{}, this.props, state(composedStores), actions
				)
			);
		}

		handleChange = () => {
			this.forceUpdate();
		}
	}
	Connect.contextTypes = {
		flux: PropTypes.Object.isRequired
	}

	return Connect;
}

function composeStores(stores) {
	let ret = {};

	Object.keys(stores).forEach(k => {
		const store = stores[k];

		ret = Object.assign({}, ret, store.getState());
	});

	return ret;
}