# Risk-Based Test Plan: WebApplication - BlankFactor

This test plan is based on the risk assessment of the WebApplication and written in Gherkin language for a functional testing approach.

The requirements for this app could be applied too for load testing, but the idea is to focus on the functionality, security and some performance aspect of the application.

---

## Risk Level Legend

| Risk Priority Range | Risk Level | Symbol | Testing Priority |
|-----------|------------|--------|------------------|
| 60-125 | Critical | 🔴 | 100% Coverage |
| 30-59 | High | 🟠 | 80%+ Coverage |
| 15-29 | Medium | 🟡 | 60%+ Coverage |
| 1-14 | Low | 🟢 | 40%+ Coverage |

## Tag Reference for Test Automation

```gherkin
# Run by risk level
@critical    # Risk Priority 60-125
@high        # Risk Priority 30-59
@medium      # Risk Priority 15-29
@low         # Risk Priority 1-14
```

---

## Risk to Test Case Mapping

| ID | Description | Priority | Level | Test Case IDs |
|---------|------------------|-----|-------|---------------|
| R-001 | Authentication bypass | 40 | 🟠 | TC-004 to TC-007 |
| R-002 | Authentication happy path failure | 75 | 🔴 | TC-003 |
| R-003 | SQL injection vulnerability | 75 | 🔴 | TC-001, TC-002 |
| R-004 | Session hijacking | 40 | 🟠 | TC-008 to TC-010 |
| R-005 | Session timeout failure | 36 | 🟠 | TC-011, TC-012, TC-014 |
| R-006 | Session state persistence | 36 | 🟠 | TC-013 |
| R-010 | XSS vulnerability | 48 | 🟠 | TC-015 |
| R-011 | Data corruption | 30 | 🟠 | TC-016, TC-017 |
| R-012 | Performance breach | 18 | 🟡 | TC-018 |
| R-013 | IIS deployment failure | 20 | 🟡 | TC-019 |
| R-014 | MSSQL connectivity issues | 20 | 🟡 | TC-020 |
| R-015 | Remember me functionality failure | 12 | 🟢 | TC-021 |

---

# 🔴 RISK (Risk Priority 60-125)

### SQL injection in username and password fields 🔴 75

```gherkin
@TC-001 @security @critical
Feature: SQL Injection Prevention - Username Field

  As a security tester
  I want to verify the system prevents SQL injection attacks
  So that unauthorized database access is blocked

  Background:
    Given I am on the login page

  Scenario: Reject SQL injection attempt with OR bypass in username
    When I enter "' OR '1'='1" in the username field
    And I enter "anypassword" in the password field
    And I click the login button
    Then I should see an error message
    And I should remain on the login page
    And no unauthorized database query should be executed
    And the login attempt should be logged for security audit

  Scenario Outline: Reject various SQL injection patterns in username
    When I enter "<injection_payload>" in the username field
    And I enter "password" in the password field
    And I click the login button
    Then I should see an error message
    And the database should remain intact

    Examples:
      | injection_payload          |
      | ' OR 1=1--                 |
      | admin'--                   |
      | ' OR 'x'='x                |
      | 1' OR '1'='1               |
      | ' OR ''='                  |


  @TC-002  @security @critical
  Scenario: Reject DROP TABLE injection attempt
    Given a valid username "testuser" exists in the database
    When I enter "testuser" in the username field
    And I enter "'; DROP TABLE Users;--" in the password field
    And I click the login button
    Then I should see an error message
    And the Users table should still exist in the database
    And all user records should be intact

  Scenario: Reject DELETE injection attempt
    When I enter "admin" in the username field
    And I enter "'; DELETE FROM Users WHERE '1'='1" in the password field
    And I click the login button
    Then I should see an error message
    And the user count in database should remain unchanged
```

---

### Valid login flow (happy path) 🔴 75

```gherkin
@TC-003 @positive @high
Feature: Valid User Login

  As a registered user
  I want to log in with valid credentials
  So that I can access the system functionality

  Background:
    Given the following users exist in the database:
      | username  | password |
      | testuser  | abcdef   |

  Scenario: Successful login with valid credentials
    
    And I am not logged in
    When I enter "testuser" in the username field
    And I enter "abcdef" in the password field
    And I click the login button
    Then I should be logged in successfully
    And I should see the functionality page
    And the server session should store my login state as "logged in"

  Scenario: Login state changes to logged in after authentication
    Given I am on the login page
    And my current login state is "not logged in"
    When I enter valid credentials
    And I click the login button
    Then my login state should change to "logged in"
```

---

# 🟠 HIGH RISK (Risk Priority 30-59)

### Invalid credentials rejected 🟠 40

```gherkin
@TC-004 @negative @high
Feature: Invalid Credentials Rejection

  As the system
  I want to reject invalid login attempts
  So that unauthorized users cannot access the system

  Background:
    Given a user "validuser" with password "abcdef" exists

  Scenario: Reject login with wrong password
    Given I am on the login page
    When I enter "validuser" in the username field
    And I enter "wrongpw" in the password field
    And I click the login button
    Then I should see an error message "Invalid username or password"
    But I should remain on the login page
    And I should be prompted to re-enter my credentials
    Then I should not be logged in

  Scenario: Reject login with non-existent username
    Given I am on the login page
    When I enter "nonexistent" in the username field
    And I enter "abcdef" in the password field
    And I click the login button
    Then I should see an error message
    And I should not be logged in
```

---

### Empty username rejected 🟠 40

```gherkin
@TC-005 @negative @high
Feature: Empty Username Validation

  As the system
  I want to reject login attempts with empty username
  So that proper credentials are always required

  Scenario: Reject login with empty username
    Given I am on the login page
    When I leave the username field empty
    And I enter "abcdef" in the password field
    And I click the login button
    Then I should see a validation error for username
    And I should not be logged in
    And the login form should remain visible
```

---

### Empty password rejected 🟠 40

```gherkin
@TC-006 @negative @high
Feature: Empty Password Validation

  As the system
  I want to reject login attempts with empty password
  So that proper credentials are always required

  Scenario: Reject login with empty password
    Given I am on the login page
    When I enter "testuser" in the username field
    And I leave the password field empty
    And I click the login button
    Then I should see a validation error for password
    And I should not be logged in

  Scenario: Reject login with both fields empty
    Given I am on the login page
    When I leave the username field empty
    And I leave the password field empty
    And I click the login button
    Then I should see validation errors for both fields
    And I should not be logged in
```

---

### Case sensitivity handling 🟠 40

```gherkin
@TC-007 @boundary @high
Feature: Username Case Sensitivity

  As the system
  I want consistent case handling for usernames
  So that users have predictable authentication behavior

  Background:
    Given a user "TestUser" with password "abcdef" exists

  Scenario Outline: Verify case sensitivity behavior for username
    Given I am on the login page
    When I enter "<username_variant>" in the username field
    And I enter "abcdef" in the password field
    And I click the login button
    Then the login result should be consistent with system design

    Examples:
      | username_variant |
      | TestUser         |
      | testuser         |
      | TESTUSER         |
      | tEsTuSeR         |
```

---

### Session token regeneration on login 🟠 40
```gherkin
@TC-008 @security @high
Feature: Session Token Regeneration

  As a security measure
  I want session tokens regenerated on login
  So that session fixation attacks are prevented

  Scenario: New session ID generated after successful login
    Given I am on the login page
    And I note my current session ID as "pre_login_session"
    When I enter valid credentials
    And I click the login button
    Then I should be logged in successfully
    And my session ID should be different from "pre_login_session"
    And the old session ID should be invalidated
```

---

### Session invalidation on logout

```gherkin
@TC-009 @security @high
Feature: Session Invalidation on Logout

  As a security measure
  I want sessions invalidated on logout
  So that logged out sessions cannot be reused

  Scenario: Session becomes invalid after logout
    Given I am logged in as "testuser"
    And I note my current session ID as "active_session"
    When I click the logout button
    Then I should see a logout confirmation message
    And I should be redirected to the login page
    When I attempt to access a protected page using "active_session"
    Then I should be redirected to the login page
    And the old session should be rejected
```

---

### Session isolation between users 🟠 40

```gherkin
@TC-010 @security @high
Feature: Session Isolation

  As a security measure
  I want sessions isolated between users
  So that users cannot access each other's sessions

  Background:
    Given the following users exist:
      | username | password |
      | userA    | passaa   |
      | userB    | passbb   |

  Scenario: Users have separate isolated sessions
    Given "userA" is logged in on Browser A
    And I note userA's session ID
    And "userB" is logged in on Browser B
    And I note userB's session ID
    Then userA's session ID should be different from userB's session ID
    When userA accesses the functionality page
    Then userA should only see their own session data
    When userB accesses the functionality page
    Then userB should only see their own session data
```

---

### 20-minute timeout enforcement 🟠 36

```gherkin
@TC-011 @positive @high
Feature: Session Timeout After Inactivity

  As a security measure
  I want sessions to expire after 20 minutes of inactivity

  Scenario: Session expires after 20 minutes of inactivity
    Given I am logged in as "testuser"
    When I remain inactive for 21 minutes
    And I attempt to access a protected page
    Then I should be redirected to the login page
    And I should see a message indicating session expiration
    And I must log in again to continue
```

---

### Activity resets timeout 🟠 36

```gherkin
@TC-012 @boundary @high
Feature: Session Timeout Reset on Activity

  As a user
  I want my session timeout to reset when I'm active
  So that I don't get logged out while actively using the system

  Scenario: Activity resets the session timeout counter
    Given I am logged in as "testuser"
    And the session timeout is set to 20 minutes
    When I wait for 15 minutes
    And I click on any navigation link
    And I wait for another 15 minutes
    And I attempt to access a protected page
    Then I should still be logged in
    And I should see the protected page content

  Scenario: Multiple activities keep session alive
    Given I am logged in as "testuser"
    When I perform the following activities with delays:
      | wait_minutes | action              |
      | 10           | click navigation    |
      | 10           | view page           |
      | 10           | click navigation    |
      | 10           | access protected    |
    Then I should still be logged in after 40 total minutes
```

---

### Server session storage verification 🟠 36

```gherkin
@TC-013 @positive @high
Feature: Server Session Storage

  As the system
  I want login state stored in IIS server session
  So that session data persists correctly across requests

  Scenario: Login state persists in server session
    Given I am logged in as "testuser"
    When I navigate to the functionality page
    And I navigate to another protected page
    And I return to the functionality page
    Then I should remain logged in throughout
    And the server session should contain my login state
    And the login state should be "logged in"

  Scenario: Session state is consistent across multiple pages
    Given I am logged in as "testuser"
    When I access 5 different protected pages in sequence
    Then my session should remain valid on all pages
    And the server should return the same session data
```

---

### Logout available on all pages 🟠 36

```gherkin
@TC-014 @positive @high
Feature: Logout Availability

  As a logged-in user
  I want logout functionality available on all pages
  So that I can securely end my session from anywhere

  Scenario: Logout option visible on all authenticated pages
    Given I am logged in as "testuser"
    When I navigate to each of the following pages:
      | page_name                    |
      | functionality selection page |
      | user profile page            |
      | settings page                |
    Then each page should display a logout option
    And the logout option should be clearly visible

  Scenario: Logout works from any authenticated page
    Given I am logged in as "testuser"
    And I am on the functionality selection page
    When I click the logout button
    Then I should be logged out
    And I should see a logout confirmation
    And I should be redirected to the login page
```

---

### Event handler injection blocked 🟠 48

```gherkin
@TC-015 @security @high
Feature Event handler injection blocked
  As a security measure
  I want event handler injections blocked
  So that DOM-based XSS attacks are prevented

  Scenario Outline: Block various event handler injections
    Given I am on the login page
    When I enter "<payload>" in the username field
    And I click the login button
    Then the event handler should not execute

    Examples:
      | payload                                    |
      | <img src=x onerror=alert('XSS')>           |
      | <img src=x onerror=alert(1)>               |
      | <svg onload=alert(1)>                      |
      | <body onload=alert(1)>                     |
      | <input onfocus=alert(1) autofocus>         |
      | <marquee onstart=alert(1)>                 |
```

---

## Feature: Data Integrity

### Malformed input handling 🟠 30

```gherkin
@TC-016 @negative @high
Feature: Malformed Input Handling

  As the system
  I want to handle malformed input gracefully
  So that the system remains stable

  Scenario: Handle null byte injection
    Given I am on the login page
    When I enter "test%00user" in the username field
    And I click the login button
    Then the system should not crash
    And I should see an appropriate response

  Scenario: Handle unicode exploit attempts
    Given I am on the login page
    When I enter "test\uFFFEuser" in the username field
    And I click the login button
    Then the system should handle the input gracefully
    And no server error should occur

  Scenario Outline: Handle various malformed inputs
    Given I am on the login page
    When I enter "<malformed_input>" in the username field
    And I click the login button
    Then the system should remain stable

    Examples:
      | malformed_input        |
      | \x00\x00\x00           |
      | %n%n%n%n               |
      | ../../../../etc/passwd |
      | \r\n\r\n               |
```

---

### Database integrity verification 🟠 30

```gherkin
@TC-017 @negative @high
Feature: Database Integrity

  As the system
  I want database integrity maintained after invalid operations
  So that data is never corrupted

  Scenario: Database remains intact after attack attempts
    Given the database has the following initial state:
      | table  | record_count |
      | Users  | 10           |
    When I execute all security test cases
    And I execute all negative test cases
    Then the Users table should still have 10 records
    And no data should be corrupted
    And all foreign key constraints should be valid
```

---

# 🟡 RISK MEDIUM (Risk Priority 15-29)

### Page navigation response time 🟡 18

```gherkin
@TC-018 @medium @performance
Feature: Page Navigation Response Time

  As a user
  I want page loads within 1 second
  So that navigation feels responsive

  Scenario: 95% of page requests complete within 1 second
    Given I am logged in as "testuser"
    When I navigate to many different pages
    And I measure each page load time
    Then at least 95% of pages should load within 1.0 second
    And no page should take longer than 3 seconds
```

---

### IIS deployment verification 🟡 20

```gherkin
@TC-019 @medium @environment
Feature: IIS Server Deployment

  As the deployment team
  I want the application to run on IIS
  So that it meets infrastructure requirements

  Scenario: Application runs on IIS server
    Given the WebApplication is deployed to IIS
    When I access the application URL
    Then I should receive an HTTP 200 status code
    And the login page HTML should be returned
    And the IIS application pool status should be "Started"

  Scenario: Application runs on IIS server 401 unauthorized error
    Given the WebApplication is deployed to IIS
    When I access the application URL
    And I am not logged in
    And I try to access a protected page
    Then I should receive an HTTP 401 status code
    And the login page HTML should be returned
```

---

### MSSQL connectivity 🟡 20

```gherkin
@TC-020 @medium @environment
Feature: MSSQL Database Connectivity

  As the system
  I want to connect to MSSQL database
  So that data persists correctly

  Scenario: Successful database connection and operations
    Given the MSSQL database is configured
    When I perform a login operation
    Then the user credentials should be verified against the database
    And session data should be stored
    And no connection errors should occur
```

---

# 🟢 RISK LOW (Risk Priority 1-14)

### TC-046: Remember me basic flow 🟢 12

```gherkin
@TC-021 @low @positive
Feature: Remember Me Functionality

  As a user
  I want my credentials remembered
  So that I don't have to enter them every time

  Scenario: Remember me checkbox saves credentials
    Given I am on the login page
    When I enter "testuser" in the username field
    And I enter "abcdef" in the password field
    And I check the "Remember me" checkbox
    And I click the login button
    Then I should be logged in successfully
    When I log out
    And I return to the login page
    Then my username should be pre-filled
    And I should not need to re-enter my credentials

  Scenario: Remember me persists across browser sessions
    Given I have previously logged in with "Remember me" checked
    When I close the browser completely
    And I open a new browser session
    And I navigate to the application
    Then I should be able to access the system without re-entering credentials
```

---

# Test Execution Summary

## Test Cases by Risk Level

| Risk Level | Count |
|------------|-------|
| 🔴 | 3 |
| 🟠 | 14 |
| 🟡 | 3 |
| 🟢 | 1 |
| **Total** | **21** |

