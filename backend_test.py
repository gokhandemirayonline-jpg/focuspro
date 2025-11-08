#!/usr/bin/env python3
"""
FocusProApp Backend API Test Suite
Tests the following endpoints:
1. Login with email and ID number
2. Profile update
3. Password change
4. Search functionality
"""

import requests
import json
import sys
from typing import Dict, Any

# Backend URL from environment
BACKEND_URL = "https://netmarkapp.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class FocusProAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str, details: Dict[str, Any] = None):
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
    
    def test_login_with_email(self):
        """Test login with email: admin@focuspro.com / admin123"""
        try:
            login_data = {
                "email_or_id": "admin@focuspro.com",
                "password": "admin123"
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.auth_token = data["access_token"]
                    self.log_test(
                        "Login with Email", 
                        True, 
                        f"Successfully logged in as {data['user']['name']}"
                    )
                    return True
                else:
                    self.log_test(
                        "Login with Email", 
                        False, 
                        "Login response missing required fields",
                        {"response": data}
                    )
            else:
                self.log_test(
                    "Login with Email", 
                    False, 
                    f"Login failed with status {response.status_code}",
                    {"response": response.text}
                )
        except Exception as e:
            self.log_test(
                "Login with Email", 
                False, 
                f"Exception during login: {str(e)}"
            )
        return False
    
    def test_login_with_id(self):
        """Test login with ID number: 0 / admin123"""
        try:
            login_data = {
                "email_or_id": "0",
                "password": "admin123"
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    # Update auth token for subsequent tests
                    self.auth_token = data["access_token"]
                    self.log_test(
                        "Login with ID Number", 
                        True, 
                        f"Successfully logged in with ID 0 as {data['user']['name']}"
                    )
                    return True
                else:
                    self.log_test(
                        "Login with ID Number", 
                        False, 
                        "Login response missing required fields",
                        {"response": data}
                    )
            else:
                self.log_test(
                    "Login with ID Number", 
                    False, 
                    f"Login failed with status {response.status_code}",
                    {"response": response.text}
                )
        except Exception as e:
            self.log_test(
                "Login with ID Number", 
                False, 
                f"Exception during login: {str(e)}"
            )
        return False
    
    def test_profile_update(self):
        """Test profile update endpoint"""
        if not self.auth_token:
            self.log_test("Profile Update", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test profile update with various fields
            profile_data = {
                "name": "Admin Test User",
                "career_title": "System Administrator",
                "phone": "+90 555 123 4567",
                "city": "Istanbul",
                "country": "Turkey",
                "language": "tr",
                "linkedin_url": "https://linkedin.com/in/admin",
                "twitter_url": "https://twitter.com/admin",
                "instagram_url": "https://instagram.com/admin",
                "facebook_url": "https://facebook.com/admin"
            }
            
            response = self.session.put(f"{API_BASE}/auth/profile", json=profile_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                # Verify that the updated data is returned
                updated_fields = []
                for key, value in profile_data.items():
                    if key in data and data[key] == value:
                        updated_fields.append(key)
                
                if len(updated_fields) >= 5:  # At least 5 fields should be updated
                    self.log_test(
                        "Profile Update", 
                        True, 
                        f"Profile updated successfully. Updated fields: {', '.join(updated_fields)}"
                    )
                    return True
                else:
                    self.log_test(
                        "Profile Update", 
                        False, 
                        f"Profile update incomplete. Only {len(updated_fields)} fields updated",
                        {"updated_fields": updated_fields, "response": data}
                    )
            else:
                self.log_test(
                    "Profile Update", 
                    False, 
                    f"Profile update failed with status {response.status_code}",
                    {"response": response.text}
                )
        except Exception as e:
            self.log_test(
                "Profile Update", 
                False, 
                f"Exception during profile update: {str(e)}"
            )
        return False
    
    def test_password_change(self):
        """Test password change endpoint"""
        if not self.auth_token:
            self.log_test("Password Change", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test password change
            password_data = {
                "current_password": "admin123",
                "new_password": "newadmin123"
            }
            
            response = self.session.post(f"{API_BASE}/auth/change-password", json=password_data, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    # Test login with new password to verify change
                    login_test = self.test_login_with_new_password("newadmin123")
                    if login_test:
                        # Change password back to original
                        self.change_password_back()
                        self.log_test(
                            "Password Change", 
                            True, 
                            "Password changed successfully and verified"
                        )
                        return True
                    else:
                        self.log_test(
                            "Password Change", 
                            False, 
                            "Password change reported success but new password doesn't work"
                        )
                else:
                    self.log_test(
                        "Password Change", 
                        False, 
                        "Password change response missing message",
                        {"response": data}
                    )
            else:
                self.log_test(
                    "Password Change", 
                    False, 
                    f"Password change failed with status {response.status_code}",
                    {"response": response.text}
                )
        except Exception as e:
            self.log_test(
                "Password Change", 
                False, 
                f"Exception during password change: {str(e)}"
            )
        return False
    
    def test_login_with_new_password(self, new_password: str):
        """Test login with new password"""
        try:
            login_data = {
                "email_or_id": "admin@focuspro.com",
                "password": new_password
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    self.auth_token = data["access_token"]
                    return True
        except Exception:
            pass
        return False
    
    def change_password_back(self):
        """Change password back to original"""
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            password_data = {
                "current_password": "newadmin123",
                "new_password": "admin123"
            }
            self.session.post(f"{API_BASE}/auth/change-password", json=password_data, headers=headers)
        except Exception:
            pass
    
    def test_search_functionality(self):
        """Test search endpoint with different search terms"""
        if not self.auth_token:
            self.log_test("Search Functionality", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test different search queries
            search_queries = [
                "admin",
                "test",
                "video",
                "focus",
                "pro"
            ]
            
            successful_searches = 0
            
            for query in search_queries:
                try:
                    response = self.session.get(f"{API_BASE}/search", params={"q": query}, headers=headers)
                    
                    if response.status_code == 200:
                        data = response.json()
                        if "results" in data and isinstance(data["results"], list):
                            successful_searches += 1
                            print(f"   Search '{query}': {len(data['results'])} results")
                        else:
                            print(f"   Search '{query}': Invalid response format")
                    else:
                        print(f"   Search '{query}': Failed with status {response.status_code}")
                except Exception as e:
                    print(f"   Search '{query}': Exception - {str(e)}")
            
            if successful_searches >= 3:  # At least 3 searches should work
                self.log_test(
                    "Search Functionality", 
                    True, 
                    f"Search working correctly. {successful_searches}/{len(search_queries)} queries successful"
                )
                return True
            else:
                self.log_test(
                    "Search Functionality", 
                    False, 
                    f"Search partially working. Only {successful_searches}/{len(search_queries)} queries successful"
                )
        except Exception as e:
            self.log_test(
                "Search Functionality", 
                False, 
                f"Exception during search testing: {str(e)}"
            )
        return False
    
    def test_auth_me_endpoint(self):
        """Test /auth/me endpoint to verify token validity"""
        if not self.auth_token:
            self.log_test("Auth Me Endpoint", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(f"{API_BASE}/auth/me", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "name" in data and "email" in data:
                    self.log_test(
                        "Auth Me Endpoint", 
                        True, 
                        f"Token valid. User: {data['name']} ({data['email']})"
                    )
                    return True
                else:
                    self.log_test(
                        "Auth Me Endpoint", 
                        False, 
                        "Auth me response missing required fields",
                        {"response": data}
                    )
            else:
                self.log_test(
                    "Auth Me Endpoint", 
                    False, 
                    f"Auth me failed with status {response.status_code}",
                    {"response": response.text}
                )
        except Exception as e:
            self.log_test(
                "Auth Me Endpoint", 
                False, 
                f"Exception during auth me test: {str(e)}"
            )
        return False
    
    def test_profile_photo_persistence(self):
        """Test profile photo persistence through login sessions"""
        if not self.auth_token:
            self.log_test("Profile Photo Persistence", False, "No auth token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Step 1: Create base64 test image data (small PNG image)
            test_image_base64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            
            print("   Step 1: Adding profile photo...")
            
            # Step 2: Update profile with photo
            profile_data = {
                "profile_photo": test_image_base64
            }
            
            response = self.session.put(f"{API_BASE}/auth/profile", json=profile_data, headers=headers)
            
            if response.status_code != 200:
                self.log_test(
                    "Profile Photo Persistence", 
                    False, 
                    f"Profile update failed with status {response.status_code}",
                    {"response": response.text}
                )
                return False
            
            update_data = response.json()
            if "profile_photo" not in update_data or update_data["profile_photo"] != test_image_base64:
                self.log_test(
                    "Profile Photo Persistence", 
                    False, 
                    "Profile photo not returned in update response",
                    {"response": update_data}
                )
                return False
            
            print("   Step 2: Profile photo updated successfully")
            
            # Step 3: Verify photo via /auth/me endpoint
            me_response = self.session.get(f"{API_BASE}/auth/me", headers=headers)
            
            if me_response.status_code != 200:
                self.log_test(
                    "Profile Photo Persistence", 
                    False, 
                    f"/auth/me failed with status {me_response.status_code}",
                    {"response": me_response.text}
                )
                return False
            
            me_data = me_response.json()
            if "profile_photo" not in me_data or me_data["profile_photo"] != test_image_base64:
                self.log_test(
                    "Profile Photo Persistence", 
                    False, 
                    "Profile photo not found in /auth/me response",
                    {"response": me_data}
                )
                return False
            
            print("   Step 3: Profile photo verified via /auth/me")
            
            # Step 4: Login again and check persistence
            login_data = {
                "email_or_id": "admin@focuspro.com",
                "password": "admin123"
            }
            
            login_response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if login_response.status_code != 200:
                self.log_test(
                    "Profile Photo Persistence", 
                    False, 
                    f"Re-login failed with status {login_response.status_code}",
                    {"response": login_response.text}
                )
                return False
            
            login_result = login_response.json()
            
            # Check if profile photo is in login response
            if "user" not in login_result or "profile_photo" not in login_result["user"]:
                self.log_test(
                    "Profile Photo Persistence", 
                    False, 
                    "Profile photo not found in login response",
                    {"response": login_result}
                )
                return False
            
            if login_result["user"]["profile_photo"] != test_image_base64:
                self.log_test(
                    "Profile Photo Persistence", 
                    False, 
                    "Profile photo in login response doesn't match saved photo",
                    {
                        "expected_length": len(test_image_base64),
                        "actual_length": len(login_result["user"]["profile_photo"]),
                        "matches": login_result["user"]["profile_photo"] == test_image_base64
                    }
                )
                return False
            
            print("   Step 4: Profile photo persisted through login")
            
            # Step 5: Update auth token and verify via /auth/me again
            self.auth_token = login_result["access_token"]
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            final_me_response = self.session.get(f"{API_BASE}/auth/me", headers=headers)
            
            if final_me_response.status_code != 200:
                self.log_test(
                    "Profile Photo Persistence", 
                    False, 
                    f"Final /auth/me check failed with status {final_me_response.status_code}",
                    {"response": final_me_response.text}
                )
                return False
            
            final_me_data = final_me_response.json()
            if "profile_photo" not in final_me_data or final_me_data["profile_photo"] != test_image_base64:
                self.log_test(
                    "Profile Photo Persistence", 
                    False, 
                    "Profile photo not persistent in final /auth/me check",
                    {"response": final_me_data}
                )
                return False
            
            print("   Step 5: Final verification successful")
            
            self.log_test(
                "Profile Photo Persistence", 
                True, 
                "Profile photo successfully persisted through all login sessions and API calls"
            )
            return True
            
        except Exception as e:
            self.log_test(
                "Profile Photo Persistence", 
                False, 
                f"Exception during profile photo persistence test: {str(e)}"
            )
        return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print(f"🚀 Starting FocusProApp Backend API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Test login methods
        email_login_success = self.test_login_with_email()
        id_login_success = self.test_login_with_id()
        
        # Test auth token validity
        auth_me_success = self.test_auth_me_endpoint()
        
        # Test profile and password functionality
        profile_success = self.test_profile_update()
        password_success = self.test_password_change()
        
        # Test profile photo persistence (specific test requested)
        photo_persistence_success = self.test_profile_photo_persistence()
        
        # Test search functionality
        search_success = self.test_search_functionality()
        
        print("=" * 60)
        print("📊 TEST SUMMARY:")
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Critical issues
        critical_failures = []
        if not email_login_success:
            critical_failures.append("Email login not working")
        if not id_login_success:
            critical_failures.append("ID number login not working")
        if not auth_me_success:
            critical_failures.append("Authentication token validation failing")
        if not photo_persistence_success:
            critical_failures.append("Profile photo persistence not working")
        
        if critical_failures:
            print("\n🚨 CRITICAL ISSUES:")
            for issue in critical_failures:
                print(f"   - {issue}")
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "success_rate": (passed_tests/total_tests)*100,
            "critical_failures": critical_failures,
            "all_results": self.test_results
        }

def main():
    """Main test execution"""
    tester = FocusProAPITester()
    results = tester.run_all_tests()
    
    # Exit with error code if critical tests failed
    if results["critical_failures"]:
        sys.exit(1)
    elif results["success_rate"] < 80:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()