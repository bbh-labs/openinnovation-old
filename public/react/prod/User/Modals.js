User.Content.ImageCropperModal = React.createClass({displayName: "ImageCropperModal",
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
			React.createElement("div", {id: "user-avatar", className: "modal"}, 
				React.createElement("div", {className: "modal-content"}, 
					React.createElement("img", {width: "256", height: "256", style: {margin: "0 auto"}, ref: "image"})
				), 
				React.createElement("div", {className: "modal-footer"}, 
					React.createElement("button", {onClick: this.handleClick, className: "modal-action modal-close waves-effect waves-green btn-flat"}, "Done")
				)
			)
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
