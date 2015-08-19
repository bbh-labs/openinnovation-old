var TagIt = React.createClass({displayName: "TagIt",
	componentDidMount: function() {
		$(React.findDOMNode(this)).tagit({
			afterTagAdded: function(e, ui) {
				if (this.props.onChange) {
					this.props.onChange(e, ui);
				}
			}.bind(this),
			afterTagRemoved: function(e, ui) {
				if (this.props.onChange) {
					this.props.onChange(e, ui);
				}
			}.bind(this),
		});
	},
	render: function() {
		return React.createElement("ul", {style: m(this.props.style)}, this.props.children)
	},
	createTag: function(tag) {
		$(React.findDOMNode(this)).tagit("createTag", tag);
	},
	removeAll: function(tag) {
		$(React.findDOMNode(this)).tagit("removeAll");
	},
});
