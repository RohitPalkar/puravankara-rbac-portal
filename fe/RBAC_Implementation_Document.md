# Puravankara Enterprise RBAC Implementation Document

> Status: Final Hybrid RBAC Architecture  
> Backend: NestJS + TypeORM + PostgreSQL  
> Frontend: React + Vite + TypeScript  
> Permission Model: Project Scoped Hybrid RBAC


---

# 1. Complete RBAC Model


## 1.1 Concept

The platform implements a scalable Hybrid Role-Based Access Control model designed for enterprise real-estate operations.

The system combines:

1. Strict Relational Data

Used for:

- Organization hierarchy
- Users
- Departments
- Roles
- Zones
- Cities
- Projects
- Audit trails


2. Flexible JSON Permission Documents

Used for:

- Project-wise feature access
- Module permissions
- Sub-module permissions
- Action visibility


This avoids heavy permission joins while supporting thousands of users and projects.



Final permission structure:


User
 │
 ▼
Department
 │
 ▼
Role + Hierarchy Level
 │
 ▼
Project Access
 │
 ▼
Feature Permission Document
 │
 ▼
Module
 │
 ▼
Sub Module (Optional)
 │
 ▼
Action



Supported permission depth:


Project
 └── Module
      └── Action


OR


Project
 └── Module
      └── Sub Module
             └── Action




---

## 1.2 Entity Relationship


Zone
 │
 ▼
City Zone Mapping
 │
 ▼
City
 │
 ▼
Project
 │
 ▼
User Project Feature Matrix
 │
 ▼
Permission JSON


Organization:


Department
 │
 ▼
Hierarchy Levels
 │
 ▼
Roles
 │
 ▼
Users



Product:


Modules
 │
 ▼
Sub Modules
 │
 ▼
Actions



---

## 1.3 Hierarchy Levels


Hierarchy levels are dynamic and controlled by Department configuration.


Example:


Department: Sales

Configured Levels: 4


System generates:


L1 Employee

L2 Manager

L3 Team Admin

L4 Department Head



Rules:

- L1 = lowest operational level
- Higher number = higher authority
- No fixed hierarchy limit
- Different departments can have different hierarchy depth



---

## 1.4 Core Entities


| Entity | Source | Description |
|--------|--------|-------------|
| Zone | Master | Geographic region grouping |
| City | Master | City master connected using city-zone mapping |
| Department | Master | Business unit defining hierarchy depth |
| Level | Dynamic Config | Generated from department max hierarchy levels |
| Role | Master | Department role assigned to hierarchy level |
| Module | Product Config | Application feature group |
| Sub Module | Product Config | Child feature under module |
| Action | Product Config | CRUD or custom operation |
| Project | Project Master | Real estate project permission scope |
| User | User Management | Employee profile and access owner |
| User Project Feature Matrix | Permission Engine | Final JSON permission document |



---

# Permission Resolution


Login:

User Login

↓

Load User Profile

↓

Resolve:

Department

Roles

Zones

Projects


↓

Fetch:

user_project_feature_matrix


↓

Return:

feature_privileges_document


↓

Frontend Builds:

Sidebar

Routes

Buttons

Actions




Example:


{
 "modules":{
    "IOM":{
       "submodules":{
          "Loyalty":[
             "GENERATE",
             "EDIT"
          ]
       }
    }
 }
}



---

# Super Admin Rule


Super Admin bypasses permission checks.


Access:

- All Zones
- All Projects
- All Modules
- All Actions


No permission document required.
---

# 2. Permission Matrix Engine

## 2.1 Overview

The permission engine controls access using a hybrid RBAC + project scoped model.

Permissions are resolved using:

- User identity
- Department
- Role
- Hierarchy level
- Assigned zones
- Assigned projects
- Feature permission document


Final access is calculated at:

Project
→ Module
→ Sub Module (Optional)
→ Action


---

## 2.2 Permission Assignment Layers


### Layer 1 — Role Permission Template

Defines default permissions for a role.


Example:


Department:

Sales


Role:

Relationship Manager


Default Access:

CRM
 └── Booking
      ✓ VIEW
      ✓ CREATE


IOM
 └── Loyalty
      ✓ GENERATE_IOM



Stored as reusable role configuration.


---


### Layer 2 — User Project Access


Defines which projects a user can access.


Example:


User:

PPL00025


Projects:

✓ Purva Park

✓ Purva Atmosphere



Different projects can have different permissions.



---


### Layer 3 — User Project Feature Matrix


Final permission document stored per:

User + Project



Table:

user_project_feature_matrix



Unique Constraint:

user_id + project_id



Example:


{
 "modules": {
    "CRM": {
       "submodules": {
          "Booking": [
             "VIEW",
             "CREATE"
          ]
       }
    },

    "IOM": {
       "submodules": {
          "Loyalty": [
             "GENERATE_IOM"
          ]
       }
    }
 }
}



This JSON document is used by frontend to dynamically render:

- Sidebar
- Routes
- Screens
- Buttons
- Actions



---

## 2.3 Supported Permission Depth


The system supports both permission models.


### Option A

For simple modules:


Project

 ↓

Module

 ↓

Action



Example:


Project:
Purva Park


Module:
Dashboard


Actions:

VIEW

EXPORT




---


### Option B

For complex modules:


Project

 ↓

Module

 ↓

Sub Module

 ↓

Action



Example:


Project:
Purva Park


Module:
CRM


Sub Module:
Booking


Actions:

VIEW

CREATE

APPROVE



---


## 2.4 Permission Resolution Flow


When a user logs in:


Step 1:

Validate User


↓

Step 2:

Check Super Admin


↓

Step 3:

Resolve Department + Roles


↓

Step 4:

Load Project Access


↓

Step 5:

Load Permission Document


↓

Step 6:

Return Permission Snapshot





Frontend receives:


{
 user:{},

 projects:[],

 permissions:{}

}




---


## 2.5 Permission Priority


Priority order:


1. Super Admin Override

2. User Permission Override

3. Project Feature Matrix

4. Role Permission Template

5. Default DENY



---

## 2.6 Super Admin Access


Super Admin bypasses permission evaluation.


Automatically receives:


✓ All Projects

✓ All Modules

✓ All Sub Modules

✓ All Actions



No manual mapping required.



---

## 2.7 Permission Examples


Example 1:


User A:


Project:

Purva Park


Permission:

CRM → Booking → VIEW



Result:


Can:

✓ View Booking


Cannot:

✕ Create Booking

✕ Delete Booking





---


Example 2:


Same User:


Project:

Purva Atmosphere


Permission:

IOM → Loyalty → Generate



Result:


Permissions are different because project scope changed.



---

## 2.8 Frontend Enforcement


Frontend consumes permission snapshot.


Controls:


Sidebar:


Permission missing:

Hide menu



Routes:


Permission missing:

Redirect 403



Buttons:


Action missing:

Hide button



Example:


User does not have:

PROJECT.DELETE


Delete button is not rendered.



---

## 2.9 Backend Enforcement


Frontend restrictions are only UX.


Backend always validates:


JWT

↓

Permission Guard

↓

Permission Engine

↓

Allow / Deny



If permission missing:


HTTP 403 Forbidden

---

# 3. User Management & Organization Hierarchy

## 3.1 Overview

The organization hierarchy is dynamically controlled through Department configuration.

Each department can define its own hierarchy depth.

Example:

Sales Department

Hierarchy Count:

4


System generates:

L1

L2

L3

L4


Rules:

- L1 represents the lowest operational employee level.
- Higher level number represents higher authority.
- Different departments can have different hierarchy structures.
- Roles are mapped to specific hierarchy levels.
- Users inherit hierarchy based on assigned role.


---

# 3.2 Department Hierarchy Configuration


During Department creation:


Input:

Department Name

Maximum Hierarchy Levels



Example:


Department:

CRM


Max Hierarchy:

4



Generated Levels:


L1

L2

L3

L4



No separate level master is required.


Levels are logical system-generated values.


---

# 3.3 Role Mapping


Roles belong to:

Department

+

Hierarchy Level



Example:


Department:

CRM



Roles:


L1

CRM Executive


L2

CRM Manager


L3

CRM Team Lead


L4

CRM Head




Rules:


- Role cannot exist without department.
- Role must belong to available hierarchy level.
- Duplicate role names at same level are restricted.
- Secondary role assignment is optional.



---

# 3.4 User Creation Flow


User creation follows a step-based flow.


## Step 1 — Basic Information


Fields:


Employee ID

(auto generated)


Employee Name


Email


Mobile


Employment Status



Supported Status:


Permanent

Contract

Serving Notice



Rules:


- Employee ID generated by system.
- Frontend never sends employee ID manually.



---


## Step 2 — Organization Mapping


Configure:


Zone Access

Department

Primary Role

Secondary Role (Optional)



Flow:


Select Department

↓

Load available Roles

↓

Select Primary Role

↓

Optional Secondary Role



Example:


Department:

Sales


Primary Role:

Relationship Manager


Secondary Role:

CRM User



---

# 3.5 Zone Assignment


Users can access one or multiple zones.


Example:


User:

PPL00034


Zones:

✓ West

✓ South



Stored:

user_zones



Zone access controls project visibility.



---

# 3.6 Reporting Hierarchy


Reporting users are dynamically loaded based on hierarchy level.



Example:

Creating:

L1 User



System shows:


L2 Manager Dropdown


L3 Team Admin Dropdown


L4 Department Head Dropdown



Rules:


Managers must belong to:

- Same department
- Higher hierarchy level



Example:


CRM User (L1)

Reports To:

CRM Manager (L2)

Reports To:

CRM Head (L4)



---

# 3.7 Project Assignment


After organization setup:


Assign:

Projects

+

Feature Permissions



Example:


User:

PPL00045


Projects:


✓ Purva Park


✓ Purva Atmosphere




Each project can have different permissions.



---

# 3.8 Complete User Relationship


Final User Structure:


User

 │

 ├── Department

 │

 ├── Primary Role

 │

 ├── Secondary Role (Optional)

 │

 ├── Zones

 │

 ├── Reporting Managers

 │

 └── Projects

        │

        └── Feature Permission Document



---

# 3.9 Login Permission Resolution


On login:


Authenticate User

↓

Load User Roles

↓

Load Zones

↓

Load Projects

↓

Load Feature Matrix

↓

Generate Permission Snapshot




The frontend uses this snapshot for:


- Sidebar visibility

- Page access

- Button visibility

- Action control



---

# 3.10 User Credential Generation


When Super Admin creates a user:


System generates:

Employee ID

Temporary Password



After successful creation:


A popup displays:


Employee Name

Employee ID

Email

Temporary Password



Actions:

Copy Credentials



Security:


Password shown only once.

Password is not stored in frontend.
---

# 4. Product Configuration & Feature Mapping

## 4.1 Overview

Product Configuration defines the feature catalogue available across the platform.

It controls:

- Modules
- Sub Modules
- Actions

These configurations become the building blocks for role permissions and user project permissions.


Permission depth supports:

Simple:

Project
 → Module
 → Action


Advanced:

Project
 → Module
 → Sub Module
 → Action



---

# 4.2 Module Master


Modules represent top-level applications or feature groups.


Examples:

- CRM
- IOM
- EOI
- Bookings
- Reports
- Dashboard



Database:

modules



Fields:

| Field | Description |
|----|----|
| id | Unique identifier |
| name | Module name |
| is_active | Enable / Disable module |



Rules:

- Modules are created dynamically.
- No frontend hardcoding.
- Disabled modules are hidden from permission assignment.



---

# 4.3 Sub Module Master


Sub Modules represent child functionality inside a module.


Examples:


Module:

CRM


Sub Modules:

- Booking
- Customer Details
- Follow Ups



Module:

IOM


Sub Modules:

- Loyalty
- Document Generation



Database:

sub_modules



Fields:

| Field | Description |
|----|----|
| id | Unique identifier |
| module_id | Parent module reference |
| name | Sub module name |
| is_active | Enable / Disable status |



Rules:

- Sub Modules are optional.
- A module can directly contain actions.
- A module can contain multiple sub modules.



---

# 4.4 Action Master


Actions represent allowed operations.


Database:

actions



Examples:


Standard Actions:

VIEW

CREATE

EDIT

DELETE



Business Actions:

APPROVE

REJECT

EXPORT

IMPORT

GENERATE_IOM

DOCUMENT_SIGN



Fields:

| Field | Description |
|----|----|
| id | Unique identifier |
| code | System action key |
| label | Display name |
| is_active | Status |



Rules:

- Actions are reusable.
- Same action can apply to multiple modules.
- Custom business actions are supported.



---

# 4.5 Module Action Mapping


Defines which actions are available for each feature.


Example:


CRM

 └── Booking

        VIEW

        CREATE

        EDIT

        APPROVE



IOM

 └── Loyalty

        GENERATE_IOM

        EDIT_IOM




Database:

module_actions



Purpose:

Creates available permission options.



---

# 4.6 Permission Tree Generation


Backend generates dynamic permission tree.


API:


GET /modules/tree



Example Response:


{
 "CRM":{
    "Booking":[
       "VIEW",
       "CREATE",
       "EDIT"
    ]
 },

 "IOM":{
    "Loyalty":[
       "GENERATE_IOM"
    ]
 }
}



Used by:

- Role Permission Matrix
- User Project Permission Matrix



---

# 4.7 Role Permission Configuration


Admin configures default permissions.


Flow:


Department

↓

Role

↓

Module Tree

↓

Select Actions



Example:


Role:

CRM Manager


Permissions:


CRM

 └── Booking

      ✓ VIEW

      ✓ CREATE

      ✓ APPROVE



These become baseline permissions.



---

# 4.8 User Project Permission Configuration


Final permissions can change project-wise.


Example:


User:

PPL00021



Project:

Purva Park


Access:


CRM

 └── Booking

      VIEW



Project:

Purva Atmosphere


Access:


CRM

 └── Booking

      VIEW

      EDIT

      APPROVE




Same user.

Different project.

Different permissions.



---

# 4.9 Frontend Rendering


Frontend receives permission snapshot.


Controls:


Sidebar:

Module visibility


Pages:

Route access


Components:

Feature visibility


Buttons:

Action visibility



Example:


Permission Missing:

BOOKING.CREATE


Result:

Create Booking button hidden.



---

# 4.10 Product Configuration Rules


- No permission values are hardcoded.
- Modules are database driven.
- Sub modules are configurable.
- Actions are reusable.
- Project permissions are generated dynamically.
- Super Admin automatically receives all features.
---

# 5. Project Master & Project Access Management

## 5.1 Overview

Project Master manages all real estate projects available in the platform.

Projects are used as the access control scope for users.

The system supports:

- Project creation and management
- Location-based project mapping
- User-wise project assignment
- Project-specific feature permissions


Example:

A user can have access to multiple projects with different permissions.

Example:

User:

PPL00025


Project Access:

Purva Park

Permissions:

CRM → Booking → VIEW


Purva Atmosphere

Permissions:

CRM → Booking → VIEW + EDIT



---

# 5.2 Project Master Entity


Project details are maintained through CRUD operations.


Database:

projects


Fields:


| Field | Description |
|----|----|
| Project Name | Name of the project |
| City | Project city/location |
| Billing Entity Name | Legal billing entity |
| Billing GSTIN | GST details |
| Phase | Project phase information |
| Brand | Associated brand |
| Company | Company name |
| Payment Gateway | Enable/Disable payment gateway configuration |
| RERA Incentive Eligible | Defines RERA incentive applicability |
| Project Image | Project media upload |
| JV Image | Joint venture media upload |
| Status | Active / Inactive |



---

# 5.3 Project CRUD Operations


Admin can perform:


## Create Project


Capture:

- Basic project details
- Location mapping
- Billing information
- Project configuration
- Media details



## View Project


Display:

- Project information
- Location details
- Configuration
- Status



## Update Project


Allow modification of:

- Project details
- Configuration values
- Media
- Status



## Delete / Disable Project


Supports:

- Soft delete
- Enable / Disable project


Historical mappings remain preserved.



---

# 5.4 Project Location Mapping


Relationship:


Zone

↓

City

↓

Project



Rules:


- Zones contain cities.
- Projects belong to cities.
- User zone access decides available projects.



Example:


Zone:

South


Cities:

Bangalore

Chennai


Projects:

Purva Park

Purva Atmosphere



---

# 5.5 Project Creation Flow


Project creation follows step-based UI.


## Step 1 — Basic Information


Fields:

- Project Name
- City
- Billing Entity Name
- Billing GSTIN



---


## Step 2 — Project Configuration


Fields:

- Phase
- Brand
- Company


Settings:

- Payment Gateway Enabled
- RERA Incentive Eligible



---


## Step 3 — Media


Uploads:

- Project Image
- JV Image



---

# 5.6 Project Listing


Columns:


| Column |
|---|
| Project Name |
| City |
| Zone |
| Brand |
| Phase |
| Payment Gateway Status |
| RERA Status |
| Active Status |
| Actions |



Available Actions:

- View
- Edit
- Enable / Disable



---

# 5.7 User Project Assignment


Projects are assigned while configuring user access.


Example:


User:

Relationship Manager


Assigned Projects:

✓ Purva Park

✓ Purva Atmosphere



Rules:


- User can have one or multiple projects.
- Project list is filtered based on user's zone access.
- Removing project access removes related permissions.



---

# 5.8 Project Feature Permission Mapping


After project assignment, feature permissions are configured.


Flow:


User

↓

Project

↓

Module

↓

Sub Module (Optional)

↓

Action



Example:


Project:

Purva Park


Allowed Features:


CRM

 └── Booking

      ✓ View

      ✓ Edit


IOM

 └── Loyalty

      ✓ Generate IOM



---

# 5.9 Runtime Behaviour


After login:


System identifies user

↓

Loads assigned projects

↓

Loads allowed modules/features

↓

Generates user access



Frontend controls:


- Project visibility
- Sidebar menu
- Pages
- Buttons
- Actions



---

# 5.10 Project Access Rules


- Projects are managed from Project Master.
- Users can access multiple projects.
- Same user can have different permissions for different projects.
- Project access and feature permissions are managed separately.
- Super Admin gets access to all projects automatically.
---

# 6. Permission Resolution & Access Control

## 6.1 Overview

The Permission Engine decides what a user can access after login.

Access is calculated using:

- User details
- Department
- Role
- Hierarchy level
- Assigned zones
- Assigned projects
- Module permissions
- Action permissions


The system follows a default secure approach:

If permission is not assigned, access is denied.


---

# 6.2 Permission Structure


Final permission hierarchy:


User

↓

Zone Access

↓

Project Access

↓

Department

↓

Role

↓

Module

↓

Sub Module (Optional)

↓

Action



Example:


User:

CRM Executive


Project:

Purva Park


Access:


CRM Module

Booking Sub Module


Allowed Actions:

✓ View

✓ Edit



Restricted:

✕ Delete

✕ Approve



---

# 6.3 Role-Based Permissions


Roles define default access permissions.


Example:


Department:

CRM


Role:

CRM Manager


Default Permissions:


CRM

 └── Booking

       View

       Create

       Edit



IOM

 └── Loyalty

       Generate IOM



When this role is assigned to a user:

These permissions become the default access.



---

# 6.4 User-Specific Project Permissions


Users can have different access for different projects.


Example:


User:

PPL00045



Project 1:

Purva Park


Access:

CRM

 └── Booking

       View Only



Project 2:

Purva Atmosphere


Access:

CRM

 └── Booking

       View

       Create

       Approve



Same user.

Different project.

Different permissions.



---

# 6.5 Multiple Role Handling


Users can have:


Primary Role

Mandatory


Secondary Role

Optional



Example:


Primary:

Sales Manager


Secondary:

CRM User



Final access:

Primary Permissions

+

Secondary Permissions



Rules:

- Secondary role is optional.
- Additional permissions are merged.
- Duplicate permissions are ignored.



---

# 6.6 Super Admin Access


Super Admin users bypass normal permission rules.


Super Admin automatically receives:


✓ All Zones

✓ All Projects

✓ All Modules

✓ All Sub Modules

✓ All Actions



No manual permission assignment required.



---

# 6.7 Login Permission Flow


When user logs in:


Step 1:

Validate User Credentials


↓

Step 2:

Identify User Role


↓

Step 3:

Load Zone Access


↓

Step 4:

Load Project Access


↓

Step 5:

Resolve Module Permissions


↓

Step 6:

Return Final Access



---

# 6.8 Frontend Permission Behaviour


The frontend dynamically changes based on user access.


Controls:


## Sidebar


If module access exists:


Show Menu


If missing:


Hide Menu



---


## Pages


Allowed:

Open Page


Not Allowed:

Show Access Denied



---


## Buttons


Example:


User has:

Project Edit Permission


Show:

Edit Button



User does not have:

Project Delete Permission


Hide:

Delete Button



---

# 6.9 Backend Security


Frontend permission handling is only for user experience.


Backend always validates every request.



Request Flow:


API Request

↓

Authentication Check

↓

Permission Check

↓

Allow / Reject



Unauthorized request returns:


403 Access Denied



---

# 6.10 Permission Rules Summary


- Access is always permission driven.
- No frontend hardcoding.
- Every user access comes from configuration.
- Project permissions can vary user-wise.
- Higher hierarchy users can manage lower levels.
- Missing permissions are denied by default.
---

# 7. User Management & Access Provisioning

## 7.1 Overview

User Management controls employee onboarding, organization mapping, hierarchy assignment, project access, and feature permissions.

The user configuration process follows a guided step-by-step workflow to ensure correct access assignment.

User setup includes:

- Basic employee details
- Department and role assignment
- Reporting hierarchy
- Zone access
- Project access
- Feature permissions


---

# 7.2 User Master

User Master stores employee information and access configuration.

Fields:

| Field | Description |
|----|----|
| Employee ID | Unique system generated employee identifier |
| Employee Name | User full name |
| Email | Login email address |
| Mobile Number | Contact number |
| Employment Status | Permanent / Contract / Serving Notice |
| Department | User's business department |
| Primary Role | Main responsibility role |
| Secondary Role | Optional additional responsibility |
| Reporting Manager | Higher hierarchy manager |
| Zone Access | Allowed geographical zones |
| Project Access | Assigned projects |
| Status | Active / Inactive |


---

# 7.3 User Creation Wizard


User onboarding is divided into multiple steps.


Flow:


Basic Details

↓

Organization Mapping

↓

Project & Permission Assignment



---

# Step 1 — Basic Information


Admin enters:


- Employee Name
- Email
- Mobile Number
- Employment Status


System Generates:


- Employee ID
- Temporary Password



Example:


Employee:

Rahul Sharma


Generated ID:

PPL00045


Temporary Password:

********



Rules:

- Employee ID cannot be manually edited.
- Email must be unique.
- Password is generated automatically.



---

# Step 2 — Organization & Hierarchy Mapping


Configure:


## Zone Access


Select allowed zones:


Example:

✓ West

✓ South



---


## Department Selection


Example:


Department:

Sales



System loads:

Available hierarchy levels and roles.



---


## Role Assignment


Assign:


Primary Role:

Mandatory


Secondary Role:

Optional



Example:


Primary:

Relationship Manager


Secondary:

CRM User



---

# 7.4 Dynamic Reporting Hierarchy


Reporting hierarchy depends on department levels.


Example:


Department:

Sales


Configured Levels:

4



Available:


L1

L2

L3

L4



Creating:

L1 User



System asks:


L2 Manager

L3 Team Admin

L4 Department Head



Rules:


- Only higher level users appear.
- Users must belong to same department.
- Reporting structure is dynamic.



---

# Step 3 — Project & Feature Access


Assign project visibility and permissions.


Flow:


Select Projects

↓

Configure Features

↓

Assign Actions



Example:


Selected Projects:


✓ Purva Park

✓ Purva Atmosphere



---

# 7.5 Feature Permission Assignment


Permissions are assigned project-wise.



Example:


Project:

Purva Park



Features:


CRM

 └── Booking

       ✓ View

       ✓ Create


IOM

 └── Loyalty

       ✓ Generate



---


Another Project:


Purva Atmosphere



CRM

 └── Booking

       ✓ View Only



Same user can have different permissions per project.



---

# 7.6 User Creation Success Flow


After successful user creation:


System displays credential popup.



Shows:


- Employee Name
- Employee ID
- Email
- Temporary Password



Available Action:


Copy Credentials



Copied Format:


Employee ID:

Email:

Password:

Login URL:



Security Rules:


- Password shown only once.
- Password is not stored in frontend.
- Popup closes after confirmation.



---

# 7.7 User Listing


User Management listing shows:


| Column |
|----|
| Employee ID |
| Name |
| Email |
| Department |
| Role |
| Status |
| Actions |



Available Actions:


View

Edit

Enable / Disable

Manage Access



---

# 7.8 User Update Rules


Allowed Updates:


- Basic information
- Department
- Roles
- Zone access
- Reporting hierarchy
- Project permissions



Restricted:


- Employee ID modification



---

# 7.9 User Deactivation


When user is disabled:


- Login blocked
- Active sessions removed
- Permissions disabled
- Audit history maintained



---

# 7.10 User Access Summary


Final user access is created from:


User Profile

+

Department

+

Role

+

Hierarchy

+

Zones

+

Projects

+

Feature Permissions



This controls:

- Login access
- Available projects
- Sidebar menu
- Screens
- Buttons
- Actions
---

# 8. Frontend Navigation & Screen Structure

## 8.1 Overview

The frontend application is a permission-driven enterprise admin portal.

All navigation items, pages, and actions are controlled dynamically based on the logged-in user's permissions.

The system supports:

- Role-based menu visibility
- Project-specific access
- Action-based button control
- Secure route access


---

# 8.2 Application Layout


The application follows a standard admin layout:


Header

+

Sidebar Navigation

+

Main Workspace



## Header Contains:

- Logged-in user details
- Notifications
- Profile menu
- Logout


## Sidebar Contains:

Dynamic menu items based on permissions.



Example:


User with Project permission:


Projects menu visible



User without Project permission:


Projects menu hidden



---

# 8.3 Sidebar Navigation Structure


Final navigation:


Dashboard


Master Management

├── Geography

│      └── Zone Master


├── Organization

│      ├── Department Master

│      └── Role Master


└── Product Configuration

       ├── Modules

       ├── Sub Modules

       └── Actions




Project Management

└── Projects




User Management

└── Users




Permission Management

├── Role Permission Matrix

└── User Project Permissions




Workflow Management

├── Workflows

├── My Approvals

├── Submitted Requests

└── Delegations




System

├── Audit Logs

└── Notifications



---

# 8.4 Dashboard Screen


Dashboard provides an overview of system activity.


Widgets:


- Total Users

- Active Projects

- Departments

- Pending Approvals

- Active Workflows



Charts:


- Users by Department

- Projects by Zone



Quick Actions:


- Create User

- Create Project

- Assign Permission



All counts are loaded from APIs.



---

# 8.5 Master Management Screens


## Geography


### Zone Master


Purpose:

Manage zones and city mapping.



Features:


- Create Zone
- Edit Zone
- Enable / Disable Zone
- Map Cities


City Mapping UI:


Left Panel:

Available Cities


Right Panel:

Mapped Cities


Actions:

Move selected cities between lists



---


## Organization


### Department Master


Features:


- Create Department
- Configure hierarchy levels
- Edit Department
- Enable / Disable



Example:


Department:

Sales


Hierarchy Count:

4


Creates:

L1-L4



---


### Role Master


Features:


- Select Department
- Select Level
- Create Role



Example:


Department:

Sales


Level:

L2


Role:

Sales Manager



---

# 8.6 Product Configuration Screens


## Module Master


Manage application modules.


Actions:


Create

Edit

Enable / Disable



---


## Sub Module Master


Manage feature groups inside modules.


Actions:


Create

Edit

Enable / Disable



---


## Action Master


Manage system actions.


Examples:


VIEW

CREATE

EDIT

DELETE

APPROVE

EXPORT



---

# 8.7 Project Management Screen


Project listing displays:


- Project Name
- City
- Zone
- Phase
- Brand
- Status



Actions:


View

Edit

Enable / Disable



Project creation:

Step 1:

Basic Information


Step 2:

Configuration


Step 3:

Media



---

# 8.8 User Management Screens


User List:


Columns:


Employee ID

Name

Email

Department

Role

Status



Actions:


View

Edit

Deactivate



---


User Creation Wizard:


Step 1:

Basic Information


Step 2:

Organization Mapping


Step 3:

Project Permissions



After creation:


Credential popup displayed with copy option.



---

# 8.9 Permission Management Screens


## Role Permission Matrix


Flow:


Department

↓

Role

↓

Module Permission Tree



Features:


- Expand / Collapse
- Select All
- Clear
- Search Module



---


## User Project Permission Matrix


Flow:


User

↓

Project

↓

Module

↓

Sub Module

↓

Action



Used for final access configuration.



---

# 8.10 Workflow Screens


Includes:


Workflow Builder


Approval Inbox


Submitted Requests


Delegation Management



Actions:


Approve

Reject

Delegate



---

# 8.11 Audit Log Screen


Tracks:


- User actions
- Login events
- Data changes
- Approval activities



Filters:


User

Date

Module

Action



---

# 8.12 Notification Center


Supports:


- Approval notifications
- System notifications
- Read / unread status


Displayed:


Header notification bell


Notification list



---

# 8.13 Permission Based UI Rules


Every UI element follows permissions.



Menu:

No access → Hidden



Page:

No access → 403 Screen



Button:

No action permission → Hidden



Example:


Without PROJECT_DELETE:


Delete button will not appear.



---

# 8.14 Frontend Rules


- No hardcoded dropdown data.
- All masters load from APIs.
- Sidebar generated from permissions.
- Components reused consistently.
- Forms include validation.
- Loading and empty states handled.
- Responsive layout supported.
---

# 9. Backend API Structure & Integration Mapping

## 9.1 Overview

The backend provides REST APIs for managing authentication, master data, projects, users, permissions, workflows, audit logs, and notifications.

All APIs follow a standard structure:

```
/api/v1/{resource}
```

Common features supported:

- JWT Authentication
- Pagination
- Search
- Sorting
- Filtering
- Input validation
- Soft delete
- Audit tracking


---

# 9.2 Authentication APIs


Purpose:

Manage user authentication and sessions.


Base:

```
/auth
```


APIs:


| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/login | User login |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Logout current session |
| POST | /auth/logout-all | Logout all devices |
| GET | /auth/me | Logged-in user profile |


Flow:


Login

↓

Validate Credentials

↓

Generate Token

↓

Return User + Permissions



---

# 9.3 Geography APIs


Purpose:

Manage geographical access structure.


## Zone Master


Base:

```
/zones
```


Operations:


| Method | Action |
|---|---|
| GET | List zones |
| POST | Create zone |
| PATCH | Update zone |
| DELETE | Disable zone |



---

## City Mapping


Base:

```
/city-zone-mappings
```


Used For:


Mapping cities with zones.



Example:


West Zone

↓

Mumbai

Pune



---

# 9.4 Organization APIs


Purpose:

Manage departments, roles, and hierarchy.



## Departments


Base:

```
/departments
```


Supports:


- Create department
- Update department
- Configure hierarchy levels
- Enable / Disable



Example:


Department:

Sales


Hierarchy:

L1-L4



---


## Roles


Base:

```
/roles
```


Supports:


- Create role
- Assign department
- Assign hierarchy level



Example:


Department:

CRM


Level:

L2


Role:

CRM Manager



---

# 9.5 Product Configuration APIs


Purpose:

Manage feature catalogue.



## Modules


```
/modules
```


## Sub Modules


```
/sub-modules
```


## Actions


```
/actions
```



Used For:


Building permission tree dynamically.



Tree API:


```
GET /modules/tree
```



Returns:


Module

↓

Sub Module

↓

Actions



---

# 9.6 Project APIs


Purpose:

Manage project master.



Base:


```
/projects
```



Supports:


- Create project
- Update project
- View project
- Enable / Disable
- Search projects



Used By:


- Project Management
- User Assignment
- Permission Matrix



---

# 9.7 User Management APIs


Purpose:

Manage employees and access.



Base:


```
/users
```



Supports:


- User listing
- User creation
- User update
- User disable



Related APIs:


```
/user-roles

/user-zones

/user-reporting-lines

/user-project-access
```



Used For:


Mapping:

User

+

Department

+

Role

+

Zone

+

Projects



---

# 9.8 Permission APIs


Purpose:

Resolve and manage access control.



Base:


```
/permissions
```



Important APIs:


| Endpoint | Purpose |
|---|---|
| /permissions/me | Current user permission snapshot |
| /permissions/explain | Debug permission result |
| /permission-templates | Role permission templates |
| /user-permission-overrides | User level changes |



---

# 9.9 Workflow APIs


Purpose:

Manage approval flows.



Workflow:


```
/workflows
```



Approvals:


```
/approvals
```



Supports:


- Submit request
- Approve
- Reject
- Approval history



---

# 9.10 Delegation APIs


Base:


```
/delegations
```



Purpose:


Allow approval responsibility transfer.



Rules:


- Cannot delegate to self
- Date overlap validation



---

# 9.11 Notification APIs


Base:


```
/notifications
```



Supports:


- User notifications
- Approval alerts
- Read status
- Unread count



Notification count:


```
GET /notifications/count
```



---

# 9.12 Audit APIs


Base:


```
/audit-logs
```



Tracks:


- Create operations
- Update operations
- Delete operations
- Login events
- Approval actions



Used For:


Compliance

Security

History tracking



---

# 9.13 API Security Flow


Every secured API follows:


Request

↓

JWT Validation

↓

User Verification

↓

Permission Check

↓

Execute API

↓

Audit Capture



---

# 9.14 API Response Standard


Success Response:


```json
{
 "statusCode":200,
 "message":"Success",
 "data":{},
 "meta":{}
}
```


Error Response:


```json
{
 "statusCode":403,
 "message":"Access Denied"
}
```


---

# 9.15 API Integration Rules


- Frontend never uses hardcoded master data.
- All dropdowns load from APIs.
- Permissions come from backend.
- Backend is final authority for access.
- Every write action is audited.
- Invalid permissions return 403.
---

# 10. End-to-End RBAC Flow & Acceptance Checklist

## 10.1 Overview

This section defines the complete RBAC lifecycle from system setup to user access validation.

The goal is to ensure:

- Master configuration is completed
- Organization hierarchy is created
- Projects are configured
- Users are provisioned
- Permissions are assigned
- User access works dynamically


---

# 10.2 Initial System Setup Flow


Super Admin performs initial configuration.



Flow:


Login as Super Admin

↓

Configure Masters

↓

Create Projects

↓

Configure Permissions

↓

Create Users

↓

Assign Access

↓

Validate User Login



---

# 10.3 Master Configuration Flow


## Step 1 — Configure Geography


Create Zones:


Example:


West

South

North

East



Map Cities:


Example:


West

├── Mumbai

└── Pune



South

├── Bangalore

└── Chennai



Acceptance:


✔ Zone created

✔ Cities mapped

✔ Projects can use mapped locations



---

## Step 2 — Configure Organization


Create Department:


Example:


Department:

Sales


Hierarchy Levels:

4



System Creates:


L1

L2

L3

L4



Acceptance:


✔ Levels generated dynamically

✔ Roles can use these levels



---

## Step 3 — Configure Roles


Create Roles:


Example:


Department:

Sales



Roles:


L1:

Sales Executive


L2:

Sales Manager


L3:

Regional Manager


L4:

Sales Head



Acceptance:


✔ Role linked with department

✔ Role linked with hierarchy level



---

# 10.4 Product Configuration Flow


Create application features.



Example:


Module:

CRM


Sub Module:

Booking


Actions:


VIEW

CREATE

EDIT

APPROVE



Acceptance:


✔ Module created

✔ Actions mapped

✔ Permission tree generated



---

# 10.5 Project Setup Flow


Create Projects.


Example:


Project:

Purva Park



Configuration:


City:

Bangalore


Brand:

Purva


Status:

Active



Acceptance:


✔ Project created

✔ Project linked with location

✔ Project available for assignment



---

# 10.6 Role Permission Setup Flow


Configure default access.


Example:


Role:

Sales Manager



Permissions:


CRM

 └── Booking

       ✓ VIEW

       ✓ CREATE



Acceptance:


✔ Permission saved

✔ Role receives default access



---

# 10.7 User Creation Flow


Super Admin creates user.



Step 1:

Basic Information


Example:


Name:

Rahul Sharma


Email:

rahul@test.com



System Generates:


Employee ID:

PPL00045


Password:

Temporary Password



Acceptance:


✔ User created

✔ Credential popup displayed

✔ Copy credentials works



---

# 10.8 User Organization Mapping


Configure:


Department:

Sales


Primary Role:

Sales Manager


Secondary Role:

Optional



Zones:


✓ South



Reporting:


L3 Manager assigned



Acceptance:


✔ Department assigned

✔ Role assigned

✔ Reporting hierarchy created



---

# 10.9 User Project Permission Setup


Assign Projects:


Example:


✓ Purva Park

✓ Purva Atmosphere



Configure permissions:



Purva Park:


CRM

 └── Booking

       ✓ VIEW



Purva Atmosphere:


CRM

 └── Booking

       ✓ VIEW

       ✓ CREATE



Acceptance:


✔ Same user supports different project permissions



---

# 10.10 User Login Validation


Login using generated credentials.


System verifies:


User

↓

Role

↓

Projects

↓

Permissions



Frontend updates dynamically.



Acceptance:


Sidebar:


✔ Allowed menus visible

✔ Restricted menus hidden



Routes:


✔ Unauthorized pages blocked



Buttons:


✔ Unauthorized actions hidden



---

# 10.11 Workflow Validation


Create approval workflow.


Example:


Approval:


L1 Employee

↓

L2 Manager

↓

L4 Head



Test:


User submits request

↓

Manager approves

↓

Status updated



Acceptance:


✔ Approval routing works

✔ Notifications generated

✔ Audit captured



---

# 10.12 Audit Validation


Perform actions:


Create User

Update Project

Approve Request



Verify Audit Logs:


Captured:

✔ User

✔ Action

✔ Timestamp

✔ Details



---

# 10.13 Final Acceptance Checklist


## Authentication

✔ Login working

✔ JWT validation

✔ Logout working



## Masters

✔ Zone

✔ Department

✔ Role

✔ Module

✔ Action

✔ Project



## User Management

✔ User creation

✔ Hierarchy mapping

✔ Zone assignment

✔ Project assignment



## Permissions

✔ Role permissions

✔ User permissions

✔ Project-wise permissions

✔ Dynamic sidebar



## Workflow

✔ Submit

✔ Approve

✔ Reject

✔ Delegate



## Security

✔ Unauthorized routes blocked

✔ API permission checks

✔ Audit logging



---

# 10.14 Final Demo Scenario


Demo User:

Sales Manager



Expected Access:


Can:

✔ View assigned projects

✔ Access allowed modules

✔ Perform allowed actions



Cannot:

✖ View restricted projects

✖ Access restricted modules

✖ Perform unauthorized actions



Result:


RBAC implementation approved when all checklist items pass.
---

# 11. Deployment Architecture & Environment Setup

## 11.1 Overview

The RBAC platform follows a cloud-ready deployment architecture.

The application is separated into:

- Frontend Application
- Backend API Service
- Database Layer
- Authentication Layer
- Deployment Pipeline


Architecture:


User Browser

↓

Frontend Application

↓

Backend API

↓

Database



---

# 11.2 Technology Stack


## Frontend

Technology:

React + TypeScript


Responsibilities:

- User Interface
- Authentication screens
- Dashboard
- Master management
- Permission-based rendering


Deployment:

Vercel



---


## Backend

Technology:

NestJS + TypeScript


Responsibilities:

- APIs
- Authentication
- RBAC Permission Engine
- Workflow Engine
- Audit Tracking
- Notifications


Deployment:

Render



---


## Database

Technology:

PostgreSQL


Responsibilities:

Stores:

- Users
- Roles
- Departments
- Projects
- Permissions
- Workflows
- Audit Logs


Deployment:

Supabase



---

# 11.3 Deployment Flow


Development

↓

GitHub Repository

↓

Build Pipeline

↓

Cloud Deployment



Repository:


puravankara-rbac-platform



Structure:


backend/

Frontend API service


frontend/

React Admin Portal



---

# 11.4 Backend Deployment


Platform:

Render


Configuration:


Root Directory:

backend



Build Command:


npm install && npm run build



Start Command:


npm run start:prod




Environment Variables:


DATABASE_URL

JWT_SECRET

JWT_REFRESH_SECRET

NODE_ENV

REDIS_ENABLED



---

# 11.5 Frontend Deployment


Platform:

Vercel



Configuration:


Root Directory:

frontend



Build Command:


npm run build



Output:


dist




Environment:


VITE_API_URL



Example:


VITE_API_URL=

https://backend-url/api/v1



---

# 11.6 Database Setup


Platform:

Supabase PostgreSQL



Contains:


Authentication Tables

↓

Organization Tables

↓

Project Tables

↓

Permission Tables

↓

Workflow Tables

↓

Audit Tables



Initial setup:


Run database seed



Creates:


- Default admin user
- Default zones
- Departments
- Roles
- Modules
- Actions



---

# 11.7 Authentication Flow


Login Request

↓

Backend Authentication

↓

JWT Generated

↓

Frontend Stores Token

↓

API Requests Include Token

↓

Permission Validation



---

# 11.8 Security Architecture


Implemented Security:


✓ JWT Authentication


✓ Refresh Token Rotation


✓ Password Encryption


✓ Global API Guards


✓ Permission Validation


✓ Rate Limiting


✓ CORS Protection


✓ Audit Tracking



---

# 11.9 Environment Strategy


## Development


Local frontend

+

Local backend

+

Development database



---


## Production


Vercel

+

Render

+

Supabase



---

# 11.10 Health Monitoring


Backend exposes:


GET

/api/v1/health



Checks:


- API availability

- Database connection



Expected:


Application:

Healthy


Database:

Connected



---

# 11.11 Production Deployment Checklist


## Backend


✔ Environment variables configured

✔ Database connected

✔ Build successful

✔ Health API working

✔ Seed completed



---


## Frontend


✔ API URL configured

✔ Production build successful

✔ Authentication tested

✔ Routes working



---


## RBAC Validation


✔ Admin login

✔ User creation

✔ Permission assignment

✔ Dynamic menu

✔ Project access

✔ Workflow approval



---

# 11.12 Final Architecture Summary


Frontend

(Vercel)

↓

REST API

↓

Backend

(Render)

↓

Database

(Supabase PostgreSQL)



Complete RBAC platform is independently scalable across all layers.

