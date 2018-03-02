import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Row, Col } from 'reactstrap';
import { Nav, Navbar, NavItem, NavLink, TabPane, TabContent } from 'reactstrap';
import classname from 'classname';

import { TABS } from '../constants'
import { setTab, logOut } from '../actions';
import Icon from './Icon';
import Login from './Login';
import MainPortal from './MainPortal';
import UserPortal from './UserPortal';
import SettingsPortal from './SettingsPortal';




const mapStateToProps = state => ({
    isLoading: state.data.isLoading
  , selection: state.ui.selection
  , search: state.ui.search
  , message: state.ui.message
  , currentTab: state.ui.tab
  , donors: Object.values(state.data.donors)
  , auth: state.auth
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
    const { auth, donors, selection, search, message, currentTab } = this.props

    if (!auth.isLoggedIn)
      return this.renderLogin()


    return (
      <div className='App'>
        <div className='App__content'>
          <Nav tabs className='App__navbar'>
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
                    Users
                  </NavLink>
                </NavItem>
            }
            <NavItem>
              <NavLink
                className={classname({ active: currentTab === TABS.SETTINGS })}
                onClick={() => this.props.setTab(TABS.SETTINGS)}
              >
                Settings
              </NavLink>
            </NavItem>

            <button className='App__logout link' onClick={this.props.logOut}>
              <Icon name='sign-out' /> Log Out
            </button>
          </Nav>

          <TabContent activeTab={currentTab} className='App__tabs'>
            <TabPane tabId={TABS.PORTAL}>
              <MainPortal />
            </TabPane>
            <TabPane tabId={TABS.USERS}>
              <UserPortal />
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
