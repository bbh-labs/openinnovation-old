var Footer = React.createClass({
	styles: {
		container: {
			marginTop: 0,
		},
	},
	render: function() {
		return (
			<footer className="page-footer" style={this.styles.container}>
				<div className="container">
					&copy; 2015 Copyright Bartle Bogle Hegarty
					<div className="footer-links">
						<a href="#">About</a>
						<a href="#">How it works</a>
						<a href="#">Get Involved</a>
						<a href="#">FAQ</a>
					</div>
				</div>
			</footer>
		)
	},
});
