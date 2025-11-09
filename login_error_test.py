#!/usr/bin/env python3
"""
FocusProApp Login Error Scenarios Test
Tests various error conditions for login functionality
"""

import requests
import json
import sys

# Backend URL from environment
BACKEND_URL = "https://netmarket-manager.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class LoginErrorTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str, details: dict = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_wrong_password_email(self):
        """Test login with correct email but wrong password"""
        try:
            login_data = {
                "email_or_id": "admin@focuspro.com",
                "password": "wrongpassword123"
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 401:
                data = response.json()
                if "detail" in data and "Geçersiz" in data["detail"]:
                    self.log_test(
                        "Wrong Password (Email)", 
                        True, 
                        "Correctly rejected login with wrong password"
                    )
                    return True
                else:
                    self.log_test(
                        "Wrong Password (Email)", 
                        False, 
                        "Wrong password rejected but error message format unexpected",
                        {"response": data}
                    )
            else:
                self.log_test(
                    "Wrong Password (Email)", 
                    False, 
                    f"Expected 401 status, got {response.status_code}",
                    {"response": response.text}
                )
        except Exception as e:
            self.log_test(
                "Wrong Password (Email)", 
                False, 
                f"Exception during test: {str(e)}"
            )
        return False
    
    def test_wrong_password_id(self):
        """Test login with correct ID but wrong password"""
        try:
            login_data = {
                "email_or_id": "0",
                "password": "wrongpassword123"
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 401:
                data = response.json()
                if "detail" in data and "Geçersiz" in data["detail"]:
                    self.log_test(
                        "Wrong Password (ID)", 
                        True, 
                        "Correctly rejected login with wrong password for ID"
                    )
                    return True
                else:
                    self.log_test(
                        "Wrong Password (ID)", 
                        False, 
                        "Wrong password rejected but error message format unexpected",
                        {"response": data}
                    )
            else:
                self.log_test(
                    "Wrong Password (ID)", 
                    False, 
                    f"Expected 401 status, got {response.status_code}",
                    {"response": response.text}
                )
        except Exception as e:
            self.log_test(
                "Wrong Password (ID)", 
                False, 
                f"Exception during test: {str(e)}"
            )
        return False
    
    def test_nonexistent_email(self):
        """Test login with non-existent email"""
        try:
            login_data = {
                "email_or_id": "nonexistent@example.com",
                "password": "admin123"
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 401:
                data = response.json()
                if "detail" in data and "Geçersiz" in data["detail"]:
                    self.log_test(
                        "Non-existent Email", 
                        True, 
                        "Correctly rejected login with non-existent email"
                    )
                    return True
                else:
                    self.log_test(
                        "Non-existent Email", 
                        False, 
                        "Non-existent email rejected but error message format unexpected",
                        {"response": data}
                    )
            else:
                self.log_test(
                    "Non-existent Email", 
                    False, 
                    f"Expected 401 status, got {response.status_code}",
                    {"response": response.text}
                )
        except Exception as e:
            self.log_test(
                "Non-existent Email", 
                False, 
                f"Exception during test: {str(e)}"
            )
        return False
    
    def test_nonexistent_id(self):
        """Test login with non-existent ID number"""
        try:
            login_data = {
                "email_or_id": "999999",
                "password": "admin123"
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 401:
                data = response.json()
                if "detail" in data and "Geçersiz" in data["detail"]:
                    self.log_test(
                        "Non-existent ID", 
                        True, 
                        "Correctly rejected login with non-existent ID"
                    )
                    return True
                else:
                    self.log_test(
                        "Non-existent ID", 
                        False, 
                        "Non-existent ID rejected but error message format unexpected",
                        {"response": data}
                    )
            else:
                self.log_test(
                    "Non-existent ID", 
                    False, 
                    f"Expected 401 status, got {response.status_code}",
                    {"response": response.text}
                )
        except Exception as e:
            self.log_test(
                "Non-existent ID", 
                False, 
                f"Exception during test: {str(e)}"
            )
        return False
    
    def test_empty_credentials(self):
        """Test login with empty credentials"""
        try:
            login_data = {
                "email_or_id": "",
                "password": ""
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            # Should return 422 for validation error or 401 for invalid credentials
            if response.status_code in [401, 422]:
                self.log_test(
                    "Empty Credentials", 
                    True, 
                    f"Correctly rejected empty credentials with status {response.status_code}"
                )
                return True
            else:
                self.log_test(
                    "Empty Credentials", 
                    False, 
                    f"Expected 401 or 422 status, got {response.status_code}",
                    {"response": response.text}
                )
        except Exception as e:
            self.log_test(
                "Empty Credentials", 
                False, 
                f"Exception during test: {str(e)}"
            )
        return False
    
    def test_missing_password(self):
        """Test login with missing password field"""
        try:
            login_data = {
                "email_or_id": "admin@focuspro.com"
                # password field missing
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            # Should return 422 for validation error
            if response.status_code == 422:
                self.log_test(
                    "Missing Password", 
                    True, 
                    "Correctly rejected request with missing password field"
                )
                return True
            else:
                self.log_test(
                    "Missing Password", 
                    False, 
                    f"Expected 422 status, got {response.status_code}",
                    {"response": response.text}
                )
        except Exception as e:
            self.log_test(
                "Missing Password", 
                False, 
                f"Exception during test: {str(e)}"
            )
        return False
    
    def test_jwt_token_validation(self):
        """Test JWT token validation with invalid token"""
        try:
            # Use an invalid token
            invalid_token = "invalid.jwt.token"
            headers = {"Authorization": f"Bearer {invalid_token}"}
            
            response = self.session.get(f"{API_BASE}/auth/me", headers=headers)
            
            if response.status_code == 401:
                data = response.json()
                if "detail" in data:
                    self.log_test(
                        "Invalid JWT Token", 
                        True, 
                        "Correctly rejected invalid JWT token"
                    )
                    return True
                else:
                    self.log_test(
                        "Invalid JWT Token", 
                        False, 
                        "Invalid token rejected but error format unexpected",
                        {"response": data}
                    )
            else:
                self.log_test(
                    "Invalid JWT Token", 
                    False, 
                    f"Expected 401 status, got {response.status_code}",
                    {"response": response.text}
                )
        except Exception as e:
            self.log_test(
                "Invalid JWT Token", 
                False, 
                f"Exception during test: {str(e)}"
            )
        return False
    
    def test_expired_token_simulation(self):
        """Test with malformed token to simulate JWT exception handling"""
        try:
            # Use a malformed token that will trigger JWT exception
            malformed_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.malformed.signature"
            headers = {"Authorization": f"Bearer {malformed_token}"}
            
            response = self.session.get(f"{API_BASE}/auth/me", headers=headers)
            
            if response.status_code == 401:
                data = response.json()
                if "detail" in data:
                    self.log_test(
                        "Malformed JWT Token", 
                        True, 
                        "Correctly handled malformed JWT token (JWT exception handling working)"
                    )
                    return True
                else:
                    self.log_test(
                        "Malformed JWT Token", 
                        False, 
                        "Malformed token rejected but error format unexpected",
                        {"response": data}
                    )
            else:
                self.log_test(
                    "Malformed JWT Token", 
                    False, 
                    f"Expected 401 status, got {response.status_code}",
                    {"response": response.text}
                )
        except Exception as e:
            self.log_test(
                "Malformed JWT Token", 
                False, 
                f"Exception during test: {str(e)}"
            )
        return False
    
    def run_all_error_tests(self):
        """Run all error scenario tests"""
        print(f"🚀 Starting FocusProApp Login Error Scenario Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Test various error scenarios
        self.test_wrong_password_email()
        self.test_wrong_password_id()
        self.test_nonexistent_email()
        self.test_nonexistent_id()
        self.test_empty_credentials()
        self.test_missing_password()
        self.test_jwt_token_validation()
        self.test_expired_token_simulation()
        
        print("=" * 60)
        print("📊 ERROR TEST SUMMARY:")
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        
        print(f"Total Error Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print("\n🚨 FAILED ERROR TESTS:")
            for test in failed_tests:
                print(f"   - {test['test']}: {test['message']}")
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "success_rate": (passed_tests/total_tests)*100,
            "failed_tests": failed_tests,
            "all_results": self.test_results
        }

def main():
    """Main test execution"""
    tester = LoginErrorTester()
    results = tester.run_all_error_tests()
    
    # Exit with error code if tests failed
    if results["success_rate"] < 80:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()