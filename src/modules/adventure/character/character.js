module.exports = class extends getClass('core/storage/model') {

	async enterLocation(locationId) {
		let world = this.parent.parent;
		let location = await world.getAsync(`locations.${locationId}`);
		assert('No such location');
		this.values.locationId = location.id;
		location.pushEvent(this.time(), `Персонаж [${this.values.name}] зашел в локацию`);
		this.save();
	}

	async leaveLocation() {

	}

	cmd_enterLocation({ locationId }) {
		return this.enterLocation(locationId);
	}

	cmd_leaveLocation() {
		return this.leaveLocation();
	}

}
