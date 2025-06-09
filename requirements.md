# OMB Accounting System Requirements

## Project Overview
This document outlines the functional and technical requirements for the OMB Accounting System.

## Requirements

### 1. Development Approach and Technology Stack
- **Development Methodology**: Test-Driven Development (TDD) approach
- **Frontend**: Web-based frontend application
- **Backend**: Node.js backend server
- **Database**: File-based database system

### 1.1 Technical Architecture Requirements
- **Service Architecture**: Each major function should be developed as a single, independent service
- **Frontend Microservices**: Split frontend into multiple micro-frontend services corresponding to major functions
  - Each major function (Quotation, Invoice, Accounts, etc.) should have its own frontend service
  - Frontend services should be independently deployable and maintainable
  - Implement micro-frontend architecture for modular development
- **Backend Services**: Each major function should have its own backend service
- **Development Process**: Follow strict TDD methodology for each service:
  - Start with writing test cases first
  - Use Red → Green → Refactor iteration cycle
  - Begin with minimal functionality and incrementally build features
  - Each service must have comprehensive test coverage before implementation

### 1.2 Development Strategy
- **Frontend-First Approach**: Prioritize frontend development with mocked backend services
  - Develop complete frontend functionality using mock data and APIs
  - Ensure frontend works independently without requiring actual backend implementation
  - Use mock APIs to simulate backend responses and data flow
- **Backend Implementation**: Implement backend services incrementally after frontend completion
  - Replace mock services with actual backend implementations one by one
  - Maintain API compatibility during the transition from mock to real services

### 2. Major Functions
The accounting system will consist of the following major functions:
1. **Quotation** - Generate and manage price quotes for customers
2. **Invoice** - Create and manage invoices for billing customers
3. **Accounts** - Manage chart of accounts and accounting entries
4. **Customers & Vendors** - Customer and vendor relationship and data management
5. **Reporting** - Generate financial and business reports
6. **Settings** - Configure company information and document templates
7. **User Management** - User account management and role-based access control

### 3. Detailed Function Requirements

#### 3.1 Quotation Functions
- **Listing Quotations** - Display a list of all quotations with basic information
- **Searching Quotations** - Search and filter quotations by various criteria
- **Creating Quotation** - Create new price quotes for customers
- **Editing Quotation** - Modify existing quotations
- **Deleting Quotation** - Remove quotations from the system
- **Splitting Quotation** - Split a single quotation into multiple quotations
- **Converting Quotation to Invoice** - Transform approved quotations into invoices

**3.1.1 Quotation Structure and Fields**
Each quotation should contain the following information:

**Customer Information:**
- Customer Name
- Customer Address
- Customer Email
- Customer Telephone Number

**Quotation Details:**
- Quotation Date
- Expiry Date (default: 30 days after issue date)

**Items Table:**
A table listing all items to be quoted with the following fields:
- Item Number
- Item Name
- Item Description
- Quantity
- Unit Price
- Line Total (calculated: Quantity × Unit Price)

**Financial Summary:**
- Subtotal (sum of all line totals)
- Discount (amount or percentage)
- Tax Information (tax rate and tax amount)
- Total Amount (after discount and tax)

**Terms and Conditions:**
- Payment Terms
- Other relevant terms and conditions

#### 3.2 Invoice Functions
The invoice module consists of two main parts:

**3.2.1 Outgoing Invoices (Sales Invoices)**
- Invoices sent from us to customers for payment collection
- **Listing Outgoing Invoices** - Display a list of all sales invoices
- **Searching Outgoing Invoices** - Search and filter sales invoices by various criteria
- **Creating Outgoing Invoice** - Create new invoices to send to customers
- **Updating Outgoing Invoice** - Modify existing sales invoices
- **Deleting Outgoing Invoice** - Remove sales invoices from the system

**3.2.2 Incoming Invoices (Purchase Invoices/Bills)**
- Invoices received from vendors that need to be paid
- **Listing Incoming Invoices** - Display a list of all vendor bills/invoices
- **Searching Incoming Invoices** - Search and filter vendor invoices by various criteria
- **Creating Incoming Invoice** - Create new vendor bills/invoices
- **Updating Incoming Invoice** - Modify existing vendor invoices
- **Deleting Incoming Invoice** - Remove vendor invoices from the system

**3.2.3 Invoice Structure and Fields**
Each invoice should contain the following information:

**Bill To Information:**
- Customer/Vendor Name
- Customer/Vendor Address
- Customer/Vendor Email
- Customer/Vendor Phone

**Our Company Information:**
- Company Name
- Company Address
- Company Phone

**Invoice Details:**
- Invoice Date

**Items Table:**
A table listing all items on the invoice with the following fields:
- Item Number
- Item Name
- Item Description
- Quantity
- Unit Price
- Line Total (calculated: Quantity × Unit Price)

**Financial Summary:**
- Subtotal (sum of all line totals)
- Discount (amount or percentage)
- Total Amount (after discount)

**Payment Information:**
- Payment Terms

#### 3.3 Customers & Vendors Functions

**3.3.1 Customer Management**
- **Listing Customers** - Display a list of all customers
- **Searching Customers** - Search and filter customers by various criteria
- **Creating Customer** - Add new customers to the system
- **Updating Customer** - Modify existing customer information
- **Deleting Customer** - Remove customers from the system

**3.3.2 Vendor Management**
- **Listing Vendors** - Display a list of all vendors
- **Searching Vendors** - Search and filter vendors by various criteria
- **Creating Vendor** - Add new vendors to the system
- **Updating Vendor** - Modify existing vendor information
- **Deleting Vendor** - Remove vendors from the system

#### 3.4 Reporting Functions
The system should generate various financial reports in multiple formats:

**3.4.1 Report Types**
- **General Ledger** - Complete record of all financial transactions
- **Account Transactions** - Detailed transaction history for specific accounts
- **Balance Sheet** - Financial position statement showing assets, liabilities, and equity
- **Profit and Loss** - Income statement showing revenues, expenses, and net income

**3.4.2 Report Formats**
All reports should be available in the following formats:
- **CSV Format** - For data analysis and spreadsheet import
- **PDF Format** - For printing and professional presentation

#### 3.5 Settings Functions
The settings module provides configuration options for the system:

**3.5.1 Company Information Setup**
- Company Name
- Company Address
- Company Contact Information (phone, email, website)
- Company Logo
- Tax Identification Numbers
- Banking Information
- Other company details for document headers

**3.5.2 Template Configuration**
- **Invoice Template Setup** - Configure layout, design, and formatting for invoice printouts
- **Quotation Template Setup** - Configure layout, design, and formatting for quotation printouts
- Template customization options (fonts, colors, layout structure)
- Header and footer customization
- Field positioning and visibility settings

#### 3.6 User Management Functions
The user management module provides user account and access control functionality:

**3.6.1 User Account Management**
- **Creating User Accounts** - Add new users to the system
- **Listing Users** - Display all user accounts
- **Updating User Information** - Modify user details and settings
- **Deleting User Accounts** - Remove users from the system
- **User Authentication** - Login/logout functionality
- **Password Management** - Password reset and change functionality

**3.6.2 Role-Based Access Control (RBAC)**
- **Role Definition** - Define different user roles with specific permissions
- **Permission Management** - Assign granular permissions to roles
- **Role Assignment** - Assign roles to users
- **Access Control** - Restrict access to functions based on user roles
- **Audit Trail** - Track user actions and access attempts

**3.6.3 Suggested User Roles**
- **Administrator** - Full system access and user management
- **Accountant** - Full access to financial functions
- **Sales Manager** - Access to quotations, invoices, and customer management
- **Data Entry** - Limited access for data input operations
- **View Only** - Read-only access to reports and data

**END OF REQUIREMENTS**

---

## Implementation Notes
Requirements gathering completed. Ready to begin implementation following TDD methodology and micro-frontend/microservices architecture.
