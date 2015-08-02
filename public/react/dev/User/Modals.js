User.Content.ImageCropperModal = React.createClass({
	componentDidMount: function() {
		var modal = React.findDOMNode(this);
		var image = React.findDOMNode(this.refs.image);
		$(image).cropper({aspectRatio: 1});

		this.dispatchID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case "openUserImageCropper":
				$(image).cropper("replace", payload.data);
				$(modal).openModal();
				break;
			case "updateUserAvatarDone":
				$(modal).closeModal();
				break;
			case "updateUserAvatarFail":
				Materialize.toast("Failed to update avatar", 1000, "red white-text");
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.dispatchID);
	},
	render: function() {
		var user = this.props.user;
		return (
			<div id="user-avatar" className="modal">
				<div className="modal-content">
					<img width="256" height="256" style={{margin: "0 auto"}} ref="image" />
				</div>
				<div className="modal-footer">
					<button onClick={this.handleClick} className="modal-action modal-close waves-effect waves-green btn-flat">Done</button>
				</div>
			</div>
		)
	},
	handleClick: function(e) {
		var image = React.findDOMNode(this.refs.image);
		var user = this.props.user;

		$(image).cropper("getCroppedCanvas").toBlob(function(blob) {
			var fd = new FormData();

			fd.append("type", "image");
			fd.append("image", blob);

			OI.updateUserAvatar(fd);
		});

		e.preventDefault();
	},
});
