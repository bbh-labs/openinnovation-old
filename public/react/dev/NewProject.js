var NewProject = React.createClass({
	render: function() {
		return (
			<div className="new-project">
				<Header />
				<main>
					<NewProject.Cover />
					<NewProject.Form />
				</main>
				<Footer />
			</div>
		)
	},
});

NewProject.Cover = React.createClass({
	componentDidMount: function() {
		var dropzone = React.findDOMNode(this);
		$(dropzone).dropzone({
            url: "/foo",
            clickable: true,
            maxFilesize: 1,
            autoProcessQueue: false,
            dictDefaultMessage: "Select your project cover (max: 1MB)",
            addedfile: function(file) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    this.file = file;
                    dropzone.style.background = "url(" + e.target.result + ") center / cover";
                }.bind(this);
                reader.readAsDataURL(file);
            }.bind(this),
		});
	},
	render: function() {
		return (
			<div className="parallax-container">
				<div ref="parallax" className="parallax">
					<img src="images/1.jpg" />
				</div>
				<div className="parallax-overlay valign-wrapper">
					<div className="valign">
						<h1>Upload a representative image</h1>
						<h4>It can be changed at later time</h4>
					</div>
				</div>
			</div>
		)
	},
});

NewProject.Form = React.createClass({
	getInitialState: function() {
		return {showOther: false};
	},
	render: function() {
		return (
			<div className="row container">
				<form className="col s8 offset-s2">
					<div className="row">
						<div className="input-field col s12">
							<input type="text" id="project-name" className="validate" />
							<label htmlFor="project-name">Name</label>
						</div>
					</div>
					<div className="row">
						<div className="input-field col s12">
							<input type="text" id="project-tagline" className="validate" />
							<label htmlFor="project-tagline">Tagline</label>
						</div>
					</div>
					<div className="row">
						<div className="input-field col s12">
							<textarea id="project-description" className="materialize-textarea"></textarea>
							<label htmlFor="project-description">Description</label>
						</div>
					</div>
					<div className="row">
						<div className="col s12">
							<label>Type</label>
							<select onChange={this.onProjectTypeChanged} className="browser-default" defaultValue="">
								<option value="" disabled>What's the project type?</option>
								<option value="advertisement">Advertisement</option>
								<option value="installation">Installation</option>
								<option value="tvcommercial">TV Commercial</option>
								<option value="website">Website</option>
								<option value="other">Other</option>
							</select>
							{
								this.state.showOther ?  <input type="text" id="project-type-other" /> : ""
							}
						</div>
					</div>
					<button type="submit" className="waves-effect waves-light btn">Submit</button>
				</form>
			</div>
		)
	},
	onProjectTypeChanged: function(e) {
		if (e.target.value == "other") {
			this.setState({showOther: true});
		} else {
			this.setState({showOther: false});
		}
	},
});
