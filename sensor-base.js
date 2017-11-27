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
		databind: { // data binding between sensors, fill with data from d1.IEQ().watch()
			notify: true,
			observer : 'onDataChanged'
		},
	},
	ready: function () {
	},
	attached: function () {
		// initialize label if possible
		this.label = this.label || (LANG && LANG[this.name.toLowerCase()+"_label"]);
	},
	icon: function () {
	},
	onDataChanged: function () {
		if(!this.databind)
			return;

		var data = this.databind[this.name] || this.databind; // select by name or give directly correct object
		this.name = this.name || data.id;

		// check data format
		if (!data || !data.avg || !Array.isArray(data.avg.d) || isNaN(data.avg.d[0]) || !Array.isArray(data.avg.i) || isNaN(data.avg.i[0]) || !Array.isArray(data.range) || isNaN(data.range[0]) || isNaN(data.range[1])) {
			return;
		}
		this.quality = data.avg.i[0];
		this.unit = data.unit;
		this.min = data.range[0];
		this.max = data.range[1];
		var val = data.avg.d[0];
		this.resolution = data.precision || this.resolution;
		if(this.resolution>0)
			val = Math.round(val/this.resolution)*this.resolution;
		var precision = -Math.ceil(Math.log10(this.resolution));
		precision = (precision>0?precision:0);
		this.value = val.toFixed(precision);

		this.label = this.label || (LANG && LANG[this.name.toLowerCase()+"_label"]) || data.label;
	}
};
