import requests
import sys
import json
from datetime import datetime

class CorporateCardAnalyticsAPITester:
    def __init__(self, base_url="https://portfolio-insight-8.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=60)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and 'message' in response_data:
                        print(f"   Response: {response_data['message']}")
                    elif isinstance(response_data, list):
                        print(f"   Response: {len(response_data)} items returned")
                except:
                    pass
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")

            self.test_results.append({
                "test": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success
            })

            return success, response.json() if success else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                "test": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": "ERROR",
                "success": False,
                "error": str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_seed_data(self):
        """Test data seeding"""
        success, response = self.run_test("Seed Data", "POST", "data/seed", 200)
        if success:
            print(f"   Created {response.get('customers_created', 0)} customers")
            print(f"   Created {response.get('transactions_created', 0)} transactions")
        return success, response

    def test_run_analysis(self):
        """Test segmentation analysis"""
        success, response = self.run_test("Run Analysis", "POST", "analyze", 200)
        if success:
            print(f"   Created {response.get('segments_created', 0)} segments")
        return success, response

    def test_get_customers(self):
        """Test get all customers"""
        success, response = self.run_test("Get Customers", "GET", "customers", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} customers")
            if len(response) > 0:
                customer = response[0]
                print(f"   Sample customer: {customer.get('company_name', 'N/A')}")
                return success, customer.get('id')
        return success, None

    def test_get_customer_detail(self, customer_id):
        """Test get customer detail"""
        if not customer_id:
            print("⚠️  Skipping customer detail test - no customer ID available")
            return False, {}
        
        success, response = self.run_test("Get Customer Detail", "GET", f"customers/{customer_id}", 200)
        if success:
            customer = response.get('customer', {})
            transactions = response.get('transactions', [])
            print(f"   Customer: {customer.get('company_name', 'N/A')}")
            print(f"   Transactions: {len(transactions)}")
        return success, response

    def test_get_segments(self):
        """Test get segments"""
        success, response = self.run_test("Get Segments", "GET", "segments", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} segments")
            for segment in response:
                print(f"   - {segment.get('name', 'N/A')}: {segment.get('customer_count', 0)} customers")
        return success, response

    def test_get_recommendations(self, customer_id):
        """Test get recommendations"""
        if not customer_id:
            print("⚠️  Skipping recommendations test - no customer ID available")
            return False, {}
        
        success, response = self.run_test("Get Recommendations", "GET", f"recommendations/{customer_id}", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} recommendations")
            for rec in response:
                print(f"   - {rec.get('product_name', 'N/A')} ({rec.get('priority', 'N/A')} priority)")
        return success, response

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, response = self.run_test("Dashboard Stats", "GET", "dashboard/stats", 200)
        if success:
            print(f"   Total customers: {response.get('total_customers', 0)}")
            print(f"   Total spend: ${response.get('total_spend', 0):,.2f}")
            print(f"   Avg spend per customer: ${response.get('avg_spend_per_customer', 0):,.2f}")
            print(f"   Total transactions: {response.get('total_transactions', 0)}")
        return success, response

def main():
    print("🚀 Starting Corporate Card Analytics API Tests")
    print("=" * 60)
    
    tester = CorporateCardAnalyticsAPITester()
    
    # Test workflow: 1) Root, 2) Seed data, 3) Run analysis, 4) Test all endpoints
    
    # 1. Test root endpoint
    tester.test_root_endpoint()
    
    # 2. Seed data
    print("\n📊 SEEDING DATA")
    print("-" * 30)
    seed_success, _ = tester.test_seed_data()
    
    if not seed_success:
        print("❌ Data seeding failed - stopping tests")
        return 1
    
    # 3. Run analysis
    print("\n🔬 RUNNING ANALYSIS")
    print("-" * 30)
    analysis_success, _ = tester.test_run_analysis()
    
    if not analysis_success:
        print("❌ Analysis failed - continuing with other tests")
    
    # 4. Test all data retrieval endpoints
    print("\n📈 TESTING DATA ENDPOINTS")
    print("-" * 30)
    
    # Get customers and extract a customer ID for detail tests
    customers_success, customer_id = tester.test_get_customers()
    
    # Test customer detail if we have an ID
    if customer_id:
        tester.test_get_customer_detail(customer_id)
        tester.test_get_recommendations(customer_id)
    
    # Test segments
    tester.test_get_segments()
    
    # Test dashboard stats
    tester.test_dashboard_stats()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        failed_tests = [t for t in tester.test_results if not t['success']]
        print("\nFailed tests:")
        for test in failed_tests:
            error_msg = test.get('error', f'Status {test["actual_status"]}')
            print(f"  - {test['test']}: {error_msg}")
        return 1

if __name__ == "__main__":
    sys.exit(main())