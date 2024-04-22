module.exports = class extends getClass('dweller') {
	cmd_run() {
		return this.project.config;
	}
}
