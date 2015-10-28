class ChartistGraph extends React.Component {

  displayName: 'ChartistGraph'

  componentWillReceiveProps(newProps) {
    this.updateChart(newProps);
  }

  componentWillUnmount() {
    if (this.chartist) {
      try {
        this.chartist.detach();
      } catch (err) {
        throw new Error('Internal chartist error', err);
      }
    }
  }

  componentDidMount() {
    this.updateChart(this.props);
  }

  updateChart(config) {
  //let Chartist = require('chartist');

    let { type, data } = config;
    let options = config.options || {};
    let responsiveOptions = config.responsiveOptions || [];
    let event;

    if (this.chartist) {
      this.chartist.update(data, options, responsiveOptions);
    } else {
      this.chartist = new Chartist[type](ReactDOM.findDOMNode(this), data, options, responsiveOptions);

      if (config.listener) {
        for (event in config.listener) {
          if (config.listener.hasOwnProperty(event)) {
            this.chartist.on(event, config.listener[event]);
          }
        }
      }

    }

    return this.chartist;
  }

  render() {
    const className = this.props.className ? ' ' + this.props.className : ''
    return (<div className={'ct-chart' + className} />)
  }

}

ChartistGraph.propTypes = {
  type: React.PropTypes.string.isRequired,
  data: React.PropTypes.object.isRequired,
  className: React.PropTypes.string,
  options: React.PropTypes.object,
  responsiveOptions: React.PropTypes.array
}




var App = React.createClass({
    
    getInitialState: function() {
        return {
            data: [], 
            periodo: "", 
            settimaneValRif: 1, 
            isValRifVisible: true
        };
    },
    
    retrieveData: function(e) {
        e.preventDefault();
        var userId = this.refs.userId.value;
        var settimanaFinale = this.refs.settimanaFinale.value;
        //alert(settimanaFinale);
        var numeroSettimane = this.refs.numeroSettimane.value;
        if (!numeroSettimane) {
            numeroSettimane = 9;
        }
        
        var settimanaFinale = moment(settimanaFinale).weekday(0).format("YYYYMMDD");
        var settimanaIniziale = moment(settimanaFinale, "YYYYMMDD").subtract(numeroSettimane, 'weeks').format("YYYYMMDD");
        var settimanaFinale =  moment(settimanaFinale, "YYYYMMDD").subtract(1, 'day').format("YYYYMMDD");
        //var settimanaIniziale = settimanaIniziale.format("YYYYMMDD")
        
        var url = "http://glibrary.ct.infn.it/django/glib/gridcore/Entries/Tracciati/?limit=400&filter[0][field]=tt&filter[0][data][type]=numeric&filter[0][data][comparison]=gt&filter[0][data][value]=" + settimanaIniziale + "&filter[1][field]=tt&filter[1][data][type]=numeric&filter[1][data][comparison]=lt&filter[1][data][value]=" + settimanaFinale;
        $.get(url, function(data) {
            var results = JSON.parse(data).records;
            var inizialWeekNumber = moment(settimanaIniziale, "YYYYMMDD").week();
            var w = [];
            for (var i = 0; i <= numeroSettimane; i++) {
                w[i] = [];
            }
            for (var i = 0; i < results.length; i++) {   
                var currentWeekNumber = moment(results[i].tt.split("_")[0], "YYYYMMDD").week();
                if (results[i].acc_t1) {
                    w[currentWeekNumber-inizialWeekNumber].push(results[i].acc_t1)
                }
            }
            var medieSettimanali = [];
            for (var i = 0; i <= numeroSettimane; i++) {
                medieSettimanali[i] = 0;
                for (var j = 0; j < w[i].length; j++) {
                    medieSettimanali[i] += parseInt(w[i][j]);
                }
                if (w[i].length) {
                    medieSettimanali[i] = Math.round(medieSettimanali[i] / w[i].length);
                }
                
            }
            //console.log(w);
            //console.log(medieSettimanali);
            this.setState({
                data: medieSettimanali, 
                periodo: "Dal " + moment(settimanaIniziale, "YYYYMMDD").format("LL") + " al " + moment(settimanaFinale, "YYYYMMDD").format("LL"),
                settimaneValRif: this.refs.settimaneValRif ? this.refs.settimaneValRif .value: 0,
                isValRifVisible: this.refs.isValRifVisible.checked
            });
        }.bind(this));
    },
    
    _handleValRifToggle: function() {
        this.setState({isValRifVisible: this.refs.isValRifVisible.checked});
        console.log(this.refs.isValRifVisible.checked);
    },
    
    render: function () {
        var valoreDiRiferimento = 0;
        for (var i = 0; i < this.state.settimaneValRif; i++) {
            valoreDiRiferimento += this.state.data[i]
        }
        if (this.state.settimaneValRif) {
            var valoreDiRiferimento = Math.round(valoreDiRiferimento / this.state.settimaneValRif);
        }
        console.log("valore di riferimento: " + valoreDiRiferimento);
        
        var data = {
            labels: new Array(this.state.data.length).join().split(',').map(function(i, index) {return ++index + ""}),
            series: [{
                name: 'series-1',
                data: this.state.data
            }]
        };
        if (this.state.isValRifVisible) {
            data.series.push({
                name: 'series-2',
                data: new Array(this.state.data.length).join().split(',').map(function(i, index) {return valoreDiRiferimento+""})
  	         });
        }

        var options = {
            fullWidth: true,
            axisY: {
                onlyInteger: true,
            },
            chartPadding: {
                left: 80
            },
            labelOffset: 50,
            width: 800,
            height: 500,
            series: {
                'series-1': {
                lineSmooth: false
            },
            'series-2': {
                    showPoint: false,
                    lineSmooth: false
            }
        }
    };
    
    return (
        <div>
            <h2>COMPITO 1</h2>
            <h3>Funzioni sensori-motorie di base</h3>
            <br/>
            
            <div style={{marginBottom: 30, marginLeft: 80}}>
                <form>
                    <div className="form-group" style={{width: "30%"}}>
                        <label htmlFor="userId">User ID</label>
                        <input type="text"
                            className="form-control"
                            id="userId"
                            ref="userId"
                            style={{marginRight: 20}}
                            placeholder="tabcog_user" />
                    </div>
                
                    <div className="form-group" style={{width: "50%"}}>
                        <label htmlFor="settimanaFinale">Settimana finale</label>
                        <input type="date" 
                            className="form-control" 
                            id="settimanaFinale" 
                            ref="settimanaFinale" 
                            style={{marginRight: 20}} 
                            defaultValue={moment().format("YYYY-MM-DD")} />
                    </div>
                     
                    <div className="form-group" style={{width: "50%"}}>
                        <label htmlFor="numeroSettimane">Numero di settimane</label>
                        <input type="text" 
                            placeholder="9" 
                            ref="numeroSettimane" 
                            className="form-control"/>
                    </div>
                    
                    <div className="checkbox">
                        <label>
                            <input type="checkbox" 
                            ref="isValRifVisible" 
                            defaultChecked
                            onChange={this._handleValRifToggle}/> Valore di riferimento
                        </label>
                    </div>
                    
                    { this.state.isValRifVisible ? <div className="form-group" style={{width: "50%"}}>
                        <label htmlFor="settimaneValRif">Numero di settimane del valore di riferimento</label>
                        <input type="text" 
                            placeholder="1" 
                            ref="settimaneValRif" 
                            className="form-control"/>
                        </div>: null}
                    
                    <button type="submit"  
                        className="btn btn-primary" 
                        onClick={this.retrieveData}>Genera grafico</button>
                    
                    <span style={{marginLeft: 30}}>{this.state.periodo}</span>
                   
                </form>
            </div>
            {this.state.data.length ? <ChartistGraph data={data} options={options}  type="Line"/> : null}
        </div>
        
        );
    }
}); 

ReactDOM.render(<App />, document.getElementById('react')); 

