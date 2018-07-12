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
		var val;

		/* Boolean decide if the average is done or not */
		if (this.wantRealAverage === undefined || this.wantRealAverage === null || this.wantRealAverage === false) {
			val = data.avg.d[0];
			this.resolution = data.precision || this.resolution;
			if(this.resolution>0)
				val = Math.round(val/this.resolution)*this.resolution;
			var precision = -Math.ceil(Math.log10(this.resolution));
			precision = (precision>0?precision:0);
			this.value = val.toFixed(precision);

			this.label = this.label || (LANG && LANG[this.name.toLowerCase()+"_label"]) || data.label
			return ;
		}

		let offset = 0; // offset setted for the sensor
		if (this.name === "Temperature")
			offset = -2;
		if (this.name === "Humidity")
			offset = 4;
		var i = 0;
		var arrValue = null;
		val = 0;
		if (data.robotId === null) {
			data.avg.d.forEach((el) => {
				if (el === offset)
					return ;
				i++;
				val += el;
			});
		}
		else {
			arrValue = {};
			for (var j = 0; j < data.robotId.length; j++) {
				let robotId = data.robotId[j];
				if (!arrValue.hasOwnProperty(robotId)) {
					// fake used to know if this is a wrong values from sensor (ie if this send the offset), so we don't want to take it in the average
					arrValue[robotId] = {
						"value": data.avg.d[j],
						"fake": (data.avg.d[j] === offset) ? true : false,
						"time": data.time[j]
					};
				}
				else if (arrValue[robotId].fake === true && (data.avg.d[j] !== offset)) {
					arrValue[robotId] = {
						"value": data.avg.d[j],
						"fake": false,
						"time": data.time[j]
					};
				}
				else if ((data.avg.d[j] !== offset) && arrValue[robotId].time > data.time[j]) {
					arrValue[robotId] = {
						"value": data.avg.d[j],
						"fake": false,
						"time": data.time[j]
					};
				}
			}
			var lenObj = 0;
			var lenFake = 0;
			for(key in arrValue) {
				if (arrValue[key].fake === true) {
					lenFake++;
				}
				lenObj++;
			}
			for(key in arrValue) {
				if (lenObj > lenFake) {
					if (arrValue[key].value != offset) {
						val += arrValue[key].value;
						i++;
					}
				}
				else { // if all values are wrong, it does the average with the wrong values
					val += arrValue[key].value;
					i++;
				}
			}
		}
		if (i !== 0)
			val /= i;

		this.resolution = data.precision || this.resolution;
		if(this.resolution>0)
			val = Math.round(val/this.resolution)*this.resolution;
		var precision = -Math.ceil(Math.log10(this.resolution));
		precision = (precision>0?precision:0);
		this.value = val.toFixed(precision);

		this.label = this.label || (LANG && LANG[this.name.toLowerCase()+"_label"]) || data.label;
	}
};
