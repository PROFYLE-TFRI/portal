import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  Container,
  Navbar,
  Nav,
  NavItem,
  NavLink,
  TabPane,
  TabContent
} from 'reactstrap';
import classname from 'classname';

import { TABS } from '../constants'
import { setTab, logOut } from '../actions';
import Icon from './Icon';
import Login from './Login';
import MainPortal from './MainPortal';
import PeerPortal from './PeerPortal';
import UserPortal from './UserPortal';
import SettingsPortal from './SettingsPortal';




const mapStateToProps = state => ({
  currentTab: state.ui.tab,
  auth: state.auth,
})
const mapDispatchToProps = dispatch =>
  bindActionCreators({ setTab, logOut }, dispatch)

class App extends Component {

  renderLogin() {
    return (
      <div className='App'>
        <Login />
      </div>
    )
  }

  render() {
    const {
      auth,
      currentTab
    } = this.props

    if (!auth.isLoggedIn)
      return this.renderLogin()


    return (
      <div className='App'>
        <div className='App__content'>
          <Navbar dark expand='md' className='bg-dark'>
            <Container>
              <Nav navbar className='App__navbar'>
                <NavItem>
                  <NavLink
                    className={classname({ active: currentTab === TABS.PORTAL })}
                    onClick={() => this.props.setTab(TABS.PORTAL)}
                  >
                    Profyle Portal
                  </NavLink>
                </NavItem>
                {
                  auth.user.isAdmin &&
                    <NavItem>
                        <NavLink
                          className={classname({ active: currentTab === TABS.USERS })}
                          onClick={() => this.props.setTab(TABS.USERS)}
                        >
                          <Icon name='user' /> Users
                      </NavLink>
                    </NavItem>
                }
                {
                  auth.user.isAdmin &&
                    <NavItem>
                        <NavLink
                          className={classname({ active: currentTab === TABS.PEERS })}
                          onClick={() => this.props.setTab(TABS.PEERS)}
                        >
                          <Icon name='database' /> Peers
                      </NavLink>
                    </NavItem>
                }
                <NavItem>
                  <NavLink
                    className={classname({ active: currentTab === TABS.SETTINGS })}
                    onClick={() => this.props.setTab(TABS.SETTINGS)}
                  >
                    <Icon name='cogs' /> Settings
                  </NavLink>
                </NavItem>

              </Nav>
              <Nav navbar className='App__navbar ml-auto'>
                <a href='#' className='App__logout nav-link' onClick={this.props.logOut}>
                  <Icon name='sign-out' /> Log Out
                </a>
              </Nav>
            </Container>
          </Navbar>

          <TabContent activeTab={currentTab} className='App__tabs'>
            <TabPane tabId={TABS.PORTAL}>
              <MainPortal />
            </TabPane>
            <TabPane tabId={TABS.USERS}>
              <UserPortal />
            </TabPane>
            <TabPane tabId={TABS.PEERS}>
              <PeerPortal />
            </TabPane>
            <TabPane tabId={TABS.SETTINGS}>
              <SettingsPortal />
            </TabPane>
          </TabContent>

        </div>
      </div>
    )
  }
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
