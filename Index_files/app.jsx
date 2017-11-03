console.clear();

const Title = ({domainCount}) => {
    return (
        <h3>
            Bridge Domain Manager ({domainCount})
        </h3>
    );
};

const DomainForm = ({addDomain}) => {
    // Input Tracker
    let input;
    // Return JSX
    return (
        <form>
            Add domain name: <input className="form-control fsInput" ref={node => {
                input = node;
            }}/>&nbsp;
            <input type="button" className="fsSubmitButton" value="Submit" onClick={(e) => {
                e.preventDefault();
                addDomain(input);

            }}/>
            <br/>
        </form>
    );
};

const Domain = ({domain, remove}) => {
    // Each Domain
    return (<tr><td>{domain.name}</td><td> {domain.createdAt}</td><td>
        <input type="button" className="fsSubmitButton" value="Remove" onClick={() => {
        remove(domain.id)
    }}/></td></tr>);
};

const DomainList = ({domains, remove}) => {
    // Map through the domains
    console.log(domains);
    let  domainNode = domains.length ? domains.map((domain) => {
        return (<Domain domain={domain} key={domain.id} remove={remove}/>)
    }) : <tr><td>No data found</td></tr>;

    return (<tbody>{domainNode}</tbody>);
};


class DomainApp extends React.Component {
    constructor(props) {
        // Pass props to parent class
        super(props);
        // Set initial state
        this.state = {
            msg: "Loading data...",
            data: []
        };
        this.apiUrl = '//59f9f7b4f5e01400123e9996.mockapi.io/domains'
    };

    // Lifecycle method
    componentDidMount() {
        // Make HTTP reques with Axios
        axios.get(this.apiUrl)
            .then((res) => {
                // Set state with result
                this.setState({msg: ''});
                this.setState({data: res.data});
            });
    }

    // Add domain handler
    addDomain(input) {
        // Assemble data
        const val = input.value;

        const valid = /^(?:[a-zA-Z0-9-]{1,61}\.){1,2}[a-zA-Z]{2,}$/.test(val);

        console.log('valid ' + valid);

        if(!valid){
            this.setState({msg: 'Invalid name.'});
            return;
        }

        let found = false;

        this.state.data.filter((domain) => {
            if (domain.name === val) {
                found =  true;
            }
        });

        console.log('found ' + found);
        if(found){
            this.setState({msg: 'Name already exists.'});
            return;
        }

       input.value = '';

        this.setState({msg: 'Saving data...'});

        const domain = {name: val, createdAt: new Date(), id: this.state.data.length + 1};
        // Update data
        axios.post(this.apiUrl, domain)
            .then((res) => {
                this.state.data.push(res.data);
                this.setState({msg: 'Domain added.'});
                this.setState({data: this.state.data});
            });
    }

    // Handle remove
    handleRemove(id) {
        this.setState({msg: 'Saving data...'});
        // Update state with filter
        axios.delete(this.apiUrl + '/' + id)
            .then((res) => {
                // Filter all domains except the one to be removed
                const remainder = this.state.data.filter((domain) => {
                    if (domain.id !== id) return domain;
                });
                this.setState({msg: 'Domain removed.'});
                this.setState({data: remainder});
            })
    }

    render() {
        // Render JSX
        return (
            <div>
                <Title domainCount={this.state.data.length}/>
                <DomainForm addDomain={this.addDomain.bind(this)}/>
                <div className="domain-msg">{this.state.msg}</div>
                <hr/>
                <table className="domain-table">
                    <thead>
                    <tr><td>Domain</td><td>Date</td><td>Actions</td></tr>
                    </thead>
                <DomainList
                    domains={this.state.data}
                    remove={this.handleRemove.bind(this)}
                />
                </table>
            </div>
        );
    }
};

ReactDOM.render(<DomainApp/>, document.getElementById('container'));