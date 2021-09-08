import React, { Component } from 'react';
import {withRouter} from 'react-router-dom';
import './App.css';

const twoDayAgo = new Date();
twoDayAgo.setDate(twoDayAgo.getDate() - 10);

let latestRegistrationDate = twoDayAgo.getTime() / 1000;

class App extends Component {
  constructor() {
    super();

    this.state = {
      freelancers: []
    };
  }

  componentDidMount() {
    this.fetchFreelancers(0, 100);
  }

  fetchFreelancers = async (offset, limit) => {
		const {match} = this.props; 
		console.log(match);

    console.log(`Fetching ${limit} freelancers from ${offset}th`);
    try { //countries[]=United States&
      // let url = `https://www.freelancer.com/api/users/0.1/users/directory?countries[]=Argentina&countries[]=Mexico&countries[]=Peru&countries[]=Uruguay&countries[]=Spain&avatar=true&offset=${offset}&limit=${limit}`;
      let url = `https://www.freelancer.com/api/users/0.1/users/directory?countries[]=${match.params.country}&avatar=true&offset=${offset}&limit=${limit}&online_only=true`;
      // url += '&online_only=1';
      const res = await fetch(url);
      const { result } = await res.json();

      const { freelancers } = this.state;
      if (result.users.length > 0) {
        console.log(`Fetched ${result.users.length} freelancers`);
        const newFreelancers = [...freelancers];
        newFreelancers.push(...result.users.filter((freelancer) => {
          const exists = freelancers.filter((fl) => fl.username === freelancer.username).length > 0;
          return !exists && freelancer.registration_date > latestRegistrationDate;
        }).map((freelancer) => {
          const newFreelancer = { ...freelancer };
          newFreelancer.profile_viewed = false;
          newFreelancer.profile_deleted = false;
          return newFreelancer;
        }));
        this.setState({ freelancers: newFreelancers });
        this.fetchFreelancers(offset + result.users.length, limit);
      } else {
        console.clear();
        console.log('Restart fetching freelancers ...');
        this.fetchFreelancers(0, limit);
      }
    } catch {
      setTimeout(() => {
        this.fetchFreelancers(offset, limit);
      }, 1000);
    }
  }

  viewFreelancerProfile = (index) => {
    const { freelancers } = this.state;
    const freelancer = freelancers[index];
    const { username } = freelancer;
    window.open(`https://www.freelancer.com/u/${username}`);
    freelancers[index].profile_viewed = true;
    this.setState({ freelancers });
  }

  removeFreelancer = (index) => {
    const { freelancers } = this.state;
    freelancers[index].profile_deleted = true;
    this.setState({ freelancers });
  }

  renderFreelancer = (freelancer, index) => {
    const { username, registration_date, profile_viewed, profile_deleted, location, avatar_cdn } = freelancer;
    const date = new Date(registration_date * 1000);
    if (profile_deleted) return null;
    return (
      <div key={index} className={`freelancer ${!profile_viewed ? 'new' : ''}`}>
        <div className="info-panel">
          <div className="info-group">
            <div className="info-avatar">
              <img src={avatar_cdn} alt="Avatar"/>
            </div>
            <div className="info-detail">
              <div className="info-detail--item">
                <label>Name: </label>
                <span>{username}</span>
              </div>
              <div className="info-detail--item">
                <label>Country: </label>
                <span>{location.country.name}</span>
              </div>
              <div className="info-detail--item">
                <label>Date: </label>
                <span>{date.getFullYear()}-{date.getMonth() + 1}-{date.getDate()}</span>
              </div>
            </div>
          </div>
					<a href = {`https://www.freelancer.com/u/${username}`} > View Profile </a>
          {/* <button className="info-btn" onClick={() => this.viewFreelancerProfile(index)}>View Profile</button> */}
          <button className="info-btn" onClick={() => this.removeFreelancer(index)}>Remove Freelancer</button>
        </div>
      </div>
    )
  }
  
  render() {
    const { freelancers } = this.state;
    const sort = (a, b) => a.registration_date - b.registration_date;
    return (
      <div className="App">
        <h3>There are {freelancers.filter((freelancer) => !freelancer.profile_deleted).length} new freelancers.</h3>
        {
          freelancers.sort(sort).map((freelancer, index) => this.renderFreelancer(freelancer, index))
        }
      </div>
    );
  }
}

export default withRouter(App);
