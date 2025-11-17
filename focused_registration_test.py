#!/usr/bin/env python3
"""
FOCUSED REGISTRATION AND LOGIN TEST
Specifically testing the user's reported issue:
"Kayıt oluşturan kullanıcı giriş yapamıyor, hata veriyor"

This test focuses on the core functionality without trying to access password hashes
(which are correctly hidden for security reasons).
"""

import requests
import json
import sys
import time
from typing import Dict, Any

# Backend URL from environment
BACKEND_URL = "https://network-wizard-3.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class FocusedRegistrationTester:
    def __init__(self):
        self.session = requests.Session()
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
            print(f"   Details: {json.dumps(details, indent=2)}")
    
    def test_complete_registration_login_flow(self):
        """Test the complete flow: Register → Login → Verify Token → Profile Access"""
        print("\n🧪 COMPLETE REGISTRATION AND LOGIN FLOW TEST")
        print("=" * 60)
        
        # Use realistic Turkish user data as requested
        test_user = {
            "name": "Mehmet Özkan",
            "email": "mehmet.ozkan@example.com",
            "password": "securepass123",
            "role": "user"
        }
        
        try:
            # Step 1: Register new user
            print(f"📝 Step 1: Registering user {test_user['email']}...")
            
            registration_response = self.session.post(f"{API_BASE}/auth/register", json=test_user)
            
            if registration_response.status_code != 200:
                self.log_test(
                    "User Registration",
                    False,
                    f"Registration failed with status {registration_response.status_code}",
                    {"response": registration_response.text, "request": test_user}
                )
                return False
            
            registration_data = registration_response.json()
            user_id = registration_data.get('id')
            user_number = registration_data.get('user_number')
            
            print(f"✅ Registration successful!")
            print(f"   User ID: {user_id}")
            print(f"   User Number: {user_number}")
            print(f"   Name: {registration_data.get('name')}")
            print(f"   Email: {registration_data.get('email')}")
            
            # Step 2: Immediate login with email
            print(f"\n🔐 Step 2: Login with email {test_user['email']}...")
            
            email_login_data = {
                "email_or_id": test_user["email"],
                "password": test_user["password"]
            }
            
            email_login_response = self.session.post(f"{API_BASE}/auth/login", json=email_login_data)
            
            if email_login_response.status_code != 200:
                self.log_test(
                    "Email Login After Registration",
                    False,
                    f"Email login failed with status {email_login_response.status_code}",
                    {
                        "request": email_login_data,
                        "response": email_login_response.text,
                        "registration_data": registration_data
                    }
                )
                return False
            
            email_login_result = email_login_response.json()
            
            if "access_token" not in email_login_result or "user" not in email_login_result:
                self.log_test(
                    "Email Login After Registration",
                    False,
                    "Login response missing access_token or user data",
                    {"response": email_login_result}
                )
                return False
            
            email_token = email_login_result["access_token"]
            print(f"✅ Email login successful! Token length: {len(email_token)}")
            
            # Step 3: Verify token works with /auth/me
            print(f"\n🔍 Step 3: Verifying token with /auth/me...")
            
            headers = {"Authorization": f"Bearer {email_token}"}
            me_response = self.session.get(f"{API_BASE}/auth/me", headers=headers)
            
            if me_response.status_code != 200:
                self.log_test(
                    "Token Verification",
                    False,
                    f"/auth/me failed with status {me_response.status_code}",
                    {"response": me_response.text}
                )
                return False
            
            me_data = me_response.json()
            
            if me_data.get('id') != user_id or me_data.get('email') != test_user['email']:
                self.log_test(
                    "Token Verification",
                    False,
                    "Token verification returned wrong user data",
                    {"expected_id": user_id, "actual_data": me_data}
                )
                return False
            
            print(f"✅ Token verification successful!")
            print(f"   Verified User: {me_data.get('name')} ({me_data.get('email')})")
            
            # Step 4: Login with user number (ID)
            if user_number is not None:
                print(f"\n🔐 Step 4: Login with user number {user_number}...")
                
                id_login_data = {
                    "email_or_id": str(user_number),
                    "password": test_user["password"]
                }
                
                id_login_response = self.session.post(f"{API_BASE}/auth/login", json=id_login_data)
                
                if id_login_response.status_code != 200:
                    self.log_test(
                        "ID Login After Registration",
                        False,
                        f"ID login failed with status {id_login_response.status_code}",
                        {
                            "request": id_login_data,
                            "response": id_login_response.text
                        }
                    )
                    return False
                
                id_login_result = id_login_response.json()
                
                if "access_token" not in id_login_result:
                    self.log_test(
                        "ID Login After Registration",
                        False,
                        "ID login response missing access_token",
                        {"response": id_login_result}
                    )
                    return False
                
                id_token = id_login_result["access_token"]
                print(f"✅ ID login successful! Token length: {len(id_token)}")
                
                # Step 5: Verify ID login token also works
                print(f"\n🔍 Step 5: Verifying ID login token...")
                
                id_headers = {"Authorization": f"Bearer {id_token}"}
                id_me_response = self.session.get(f"{API_BASE}/auth/me", headers=id_headers)
                
                if id_me_response.status_code != 200:
                    self.log_test(
                        "ID Token Verification",
                        False,
                        f"/auth/me with ID token failed with status {id_me_response.status_code}",
                        {"response": id_me_response.text}
                    )
                    return False
                
                id_me_data = id_me_response.json()
                
                if id_me_data.get('id') != user_id:
                    self.log_test(
                        "ID Token Verification",
                        False,
                        "ID token verification returned wrong user",
                        {"expected_id": user_id, "actual_data": id_me_data}
                    )
                    return False
                
                print(f"✅ ID token verification successful!")
            
            # Step 6: Test wrong password (should fail)
            print(f"\n🚫 Step 6: Testing wrong password (should fail)...")
            
            wrong_login_data = {
                "email_or_id": test_user["email"],
                "password": "wrongpassword123"
            }
            
            wrong_response = self.session.post(f"{API_BASE}/auth/login", json=wrong_login_data)
            
            if wrong_response.status_code == 200:
                self.log_test(
                    "Wrong Password Test",
                    False,
                    "Login succeeded with wrong password - SECURITY ISSUE!",
                    {"response": wrong_response.json()}
                )
                return False
            
            print(f"✅ Wrong password correctly rejected (status: {wrong_response.status_code})")
            
            # Step 7: Test profile update to ensure full functionality
            print(f"\n📝 Step 7: Testing profile update functionality...")
            
            profile_update = {
                "name": "Mehmet Özkan Updated",
                "career_title": "Software Developer",
                "city": "Istanbul"
            }
            
            profile_response = self.session.put(f"{API_BASE}/auth/profile", json=profile_update, headers=headers)
            
            if profile_response.status_code != 200:
                self.log_test(
                    "Profile Update Test",
                    False,
                    f"Profile update failed with status {profile_response.status_code}",
                    {"response": profile_response.text}
                )
                return False
            
            profile_data = profile_response.json()
            
            if profile_data.get('name') != profile_update['name']:
                self.log_test(
                    "Profile Update Test",
                    False,
                    "Profile update didn't save correctly",
                    {"expected": profile_update, "actual": profile_data}
                )
                return False
            
            print(f"✅ Profile update successful!")
            
            # Cleanup - delete test user
            self.cleanup_test_user(user_id, email_token)
            
            self.log_test(
                "Complete Registration and Login Flow",
                True,
                f"ALL TESTS PASSED! User {test_user['email']} can register and login successfully with both email and ID"
            )
            
            return True
            
        except Exception as e:
            self.log_test(
                "Complete Registration and Login Flow",
                False,
                f"Exception during test: {str(e)}"
            )
            return False
    
    def test_multiple_users_registration(self):
        """Test multiple user registrations to ensure no conflicts"""
        print("\n🧪 MULTIPLE USERS REGISTRATION TEST")
        print("=" * 60)
        
        users = [
            {
                "name": "Ayşe Demir",
                "email": "ayse.demir@example.com",
                "password": "aysepass123",
                "role": "user"
            },
            {
                "name": "Can Yılmaz",
                "email": "can.yilmaz@example.com", 
                "password": "canpass123",
                "role": "user"
            },
            {
                "name": "Zeynep Kaya",
                "email": "zeynep.kaya@example.com",
                "password": "zeyneppass123",
                "role": "user"
            }
        ]
        
        registered_users = []
        
        try:
            for i, user in enumerate(users, 1):
                print(f"\n👤 Registering user {i}: {user['email']}...")
                
                # Register user
                reg_response = self.session.post(f"{API_BASE}/auth/register", json=user)
                
                if reg_response.status_code != 200:
                    self.log_test(
                        f"Multi-User Registration {i}",
                        False,
                        f"Registration failed for {user['email']}: {reg_response.status_code}",
                        {"response": reg_response.text}
                    )
                    continue
                
                reg_data = reg_response.json()
                registered_users.append((user, reg_data))
                
                print(f"✅ Registered: {reg_data.get('name')} (ID: {reg_data.get('user_number')})")
                
                # Immediate login test
                login_data = {
                    "email_or_id": user["email"],
                    "password": user["password"]
                }
                
                login_response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
                
                if login_response.status_code != 200:
                    self.log_test(
                        f"Multi-User Login {i}",
                        False,
                        f"Login failed for {user['email']}: {login_response.status_code}",
                        {"response": login_response.text}
                    )
                    continue
                
                login_result = login_response.json()
                
                if "access_token" not in login_result:
                    self.log_test(
                        f"Multi-User Login {i}",
                        False,
                        f"No access token for {user['email']}",
                        {"response": login_result}
                    )
                    continue
                
                print(f"✅ Login successful for {user['email']}")
                
                # Cleanup
                token = login_result["access_token"]
                self.cleanup_test_user(reg_data.get('id'), token)
            
            if len(registered_users) == len(users):
                self.log_test(
                    "Multiple Users Registration",
                    True,
                    f"All {len(users)} users registered and logged in successfully"
                )
                return True
            else:
                self.log_test(
                    "Multiple Users Registration",
                    False,
                    f"Only {len(registered_users)}/{len(users)} users completed successfully"
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Multiple Users Registration",
                False,
                f"Exception during multi-user test: {str(e)}"
            )
            return False
    
    def cleanup_test_user(self, user_id: str, token: str):
        """Clean up test user"""
        try:
            # Get admin token first
            admin_login = {
                "email_or_id": "admin@focuspro.com",
                "password": "admin123"
            }
            
            admin_response = self.session.post(f"{API_BASE}/auth/login", json=admin_login)
            
            if admin_response.status_code == 200:
                admin_data = admin_response.json()
                admin_token = admin_data.get("access_token")
                
                if admin_token:
                    headers = {"Authorization": f"Bearer {admin_token}"}
                    delete_response = self.session.delete(f"{API_BASE}/users/{user_id}", headers=headers)
                    
                    if delete_response.status_code == 200:
                        print(f"🧹 Test user {user_id} cleaned up")
                    else:
                        print(f"⚠️  Failed to cleanup user {user_id}")
        except Exception:
            pass  # Cleanup is best effort
    
    def run_all_tests(self):
        """Run all focused registration and login tests"""
        print("🚀 FOCUSED REGISTRATION AND LOGIN TESTING")
        print("Testing user report: 'Kayıt oluşturan kullanıcı giriş yapamıyor, hata veriyor'")
        print("Backend URL:", BACKEND_URL)
        print("=" * 70)
        
        # Test 1: Complete registration and login flow
        flow_success = self.test_complete_registration_login_flow()
        
        # Test 2: Multiple users to ensure no conflicts
        multi_success = self.test_multiple_users_registration()
        
        # Summary
        print("\n" + "=" * 70)
        print("📊 TEST SUMMARY:")
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result["success"]]
        if failed_tests:
            print("\n🚨 FAILED TESTS:")
            for test in failed_tests:
                print(f"   ❌ {test['test']}: {test['message']}")
        else:
            print("\n✅ ALL TESTS PASSED!")
            print("\n🎉 SONUÇ: YENİ KULLANICI KAYIT VE GİRİŞ SİSTEMİ TAM ÇALIŞIYOR!")
            print("   - Yeni kullanıcılar başarıyla kayıt olabiliyor")
            print("   - Kayıt sonrası hemen email ile giriş yapabiliyor")
            print("   - Kayıt sonrası hemen ID numarası ile giriş yapabiliyor")
            print("   - Token doğrulama çalışıyor")
            print("   - Profil güncelleme çalışıyor")
            print("   - Yanlış şifre girişleri doğru şekilde reddediliyor")
        
        return len(failed_tests) == 0

def main():
    """Main test execution"""
    tester = FocusedRegistrationTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ KULLANICI RAPORU DOĞRULANAMADI - SİSTEM ÇALIŞIYOR!")
        print("Kayıt olan kullanıcılar sorunsuz giriş yapabiliyor.")
        sys.exit(0)
    else:
        print("\n❌ KULLANICI RAPORU DOĞRULANDI - SORUN TESPİT EDİLDİ!")
        print("Kayıt olan kullanıcılar giriş yapamıyor.")
        sys.exit(1)

if __name__ == "__main__":
    main()