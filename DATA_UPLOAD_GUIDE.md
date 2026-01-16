# CSV Data Upload Guide

## Overview
The Corporate Card Analytics platform now supports uploading your own customer and transaction data via CSV files.

## How to Upload Data

### Step 1: Download Templates
1. Go to the **Data Management** page
2. Click **"Download Template"** for both Customers and Transactions
3. These templates show the exact format needed

### Step 2: Prepare Your Data

#### Customers CSV Format
**Required columns:**
- `company_name` - Company name (text)
- `monthly_spend` - Average monthly spend in dollars (number)
- `spend_volatility` - Spend volatility from 0 to 1 (0.1 = stable, 0.8 = highly variable)
- `international_ratio` - Ratio of international transactions from 0 to 1 (0.5 = 50% international)
- `payment_timeliness_score` - Payment timeliness from 0 to 1 (1.0 = always on time)

**Example:**
```csv
company_name,monthly_spend,spend_volatility,international_ratio,payment_timeliness_score
Acme Corp,50000,0.3,0.4,0.9
TechStart Inc,30000,0.5,0.2,0.85
```

#### Transactions CSV Format
**Required columns:**
- `customer_id` - Unique identifier matching a customer (must be consistent across both files)
- `amount` - Transaction amount in dollars (number)
- `merchant_category` - Category (e.g., "Travel & Transportation", "Hotels & Lodging", "Office Supplies")
- `is_international` - true or false
- `transaction_date` - Date in YYYY-MM-DD format
- `merchant_name` - Name of the merchant

**Example:**
```csv
customer_id,amount,merchant_category,is_international,transaction_date,merchant_name
cust-001,1500.50,Travel & Transportation,true,2025-01-15,United Airlines
cust-001,250.00,Restaurants,false,2025-01-14,Starbucks
```

### Step 3: Upload Files
1. Click **"Choose Customers CSV"** and select your customers file
2. Wait for upload confirmation
3. Click **"Choose Transactions CSV"** and select your transactions file
4. Wait for upload confirmation

### Step 4: Run Analysis
1. After uploading both files, click **"Run Segmentation"**
2. The system will analyze your data using K-Means clustering
3. View results in Dashboard, Segmentation, and Customers pages

## Important Notes

### Customer IDs
- Use consistent `customer_id` values in both files
- Transaction `customer_id` must match customers in the customers CSV
- IDs can be any format (e.g., "cust-001", "C12345", company names)

### Data Requirements
- Minimum 4 customers required for segmentation
- At least one transaction per customer recommended
- All numeric values should be positive

### Merchant Categories
Recommended categories:
- Travel & Transportation
- Hotels & Lodging
- Restaurants
- Office Supplies
- Technology & Software
- Professional Services
- Marketing & Advertising
- Utilities
- Shipping & Logistics

### Date Format
- Must be YYYY-MM-DD (e.g., 2025-01-15)
- Dates should be recent (within last 12 months for best analysis)

## Sample Data Files
Sample CSV files are available in `/app/sample_data/`:
- `customers_sample.csv` - Example customer data
- `transactions_sample.csv` - Example transaction data

## Troubleshooting

**Upload fails:**
- Check that all required columns are present
- Verify column names match exactly (case-sensitive)
- Ensure no special characters in CSV
- Check that numeric fields contain valid numbers

**Segmentation fails:**
- Ensure you have at least 4 customers
- Verify customer_id values match between files
- Check that all required fields have valid values

**Data not showing:**
- Refresh the page after upload
- Run segmentation analysis after upload
- Check browser console for errors

## Privacy & Security
- All data is stored locally in your MongoDB instance
- Data is never shared externally
- You can delete all data by re-uploading or generating new synthetic data
