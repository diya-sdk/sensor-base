window.DiyaBehaviors = window.DiyaBehaviors || {};
DiyaBehaviors.SensorBase = {
	properties: {
		label: { notify: true },
		name: { notify: true },
		period: {
			type: Number,
			value: 30000,
			notify: true
		},
		value: { notify: true },
		min: { notify: true },
		max: { notify: true },
		resolution: {
			type: Number,
			value: 1,
			notify: true
		},
		precision: {
			type: Number,
			value: 0,
			notify: true
		},
		databind: { // data binding between sensors, fill with data from d1.IEQ().watch()
			notify: true,
			observer : 'onDataChanged'
		}
	},
	ready: function () {
	},
	icon: function () {
	},
	onDataChanged: function() {
		if(!this.databind)
			return;

		var data = this.databind[this.name];
		// console.log(data);

		// check data format
		if (!data || !data.avg || !Array.isArray(data.avg.d) || isNaN(data.avg.d[0]) || !Array.isArray(data.avg.i) || isNaN(data.avg.i[0]) || !Array.isArray(data.range) || isNaN(data.range[0]) || isNaN(data.range[1])) {
			return;
		}
		this.quality = data.avg.i[0];
		this.unit = data.unit;
		this.min = data.range[0];
		this.max = data.range[1];
		var val = data.avg.d[0];
		if(this.resolution>0)
			val = Math.round(val/this.resolution)*this.resolution;
		this.value = val.toFixed(this.precision);
		// console.log(this.value);
	}
};
