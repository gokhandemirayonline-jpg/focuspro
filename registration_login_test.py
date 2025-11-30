#!/usr/bin/env python3
"""
KAYIT VE GİRİŞ SORUNU DETAYLI TEST
Kullanıcı raporları:
1. "Çıkış yap menüsü görülmüyor" 
2. "Kayıt oluşturan kullanıcı giriş yapamıyor, hata veriyor"

Test Senaryoları:
1. Yeni Kullanıcı Kaydı ve Hemen Giriş
2. Şifre Hash Kontrolü
3. Kayıt Sonrası Kullanıcı Verisi
4. Giriş Hata Senaryoları
5. Veritabanı Kontrol
"""

import requests
import json
import sys
import time
from typing import Dict, Any

# Backend URL from environment
BACKEND_URL = "https://agent-learninghub.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class RegistrationLoginTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.admin_token = None
        
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
    
    def get_admin_token(self):
        """Get admin token for database verification"""
        try:
            login_data = {
                "email_or_id": "admin@focuspro.com",
                "password": "admin123"
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data:
                    self.admin_token = data["access_token"]
                    print("🔑 Admin token obtained for database verification")
                    return True
            
            print("❌ Failed to get admin token")
            return False
        except Exception as e:
            print(f"❌ Exception getting admin token: {str(e)}")
            return False
    
    def test_new_user_registration_and_login(self):
        """Test 1: Yeni Kullanıcı Kaydı ve Hemen Giriş"""
        print("\n🧪 TEST 1: YENİ KULLANICI KAYDI VE HEMEN GİRİŞ")
        print("=" * 50)
        
        # Test user data - using realistic data as requested
        test_user = {
            "name": "Ahmet Yılmaz",
            "email": "newtestuser@example.com",
            "password": "newtest123",
            "role": "user"
        }
        
        try:
            # Step 1: Register new user
            print(f"📝 Step 1: Registering user {test_user['email']}...")
            
            registration_response = self.session.post(f"{API_BASE}/auth/register", json=test_user)
            
            if registration_response.status_code != 200:
                self.log_test(
                    "Yeni Kullanıcı Kaydı",
                    False,
                    f"Registration failed with status {registration_response.status_code}",
                    {"response": registration_response.text, "user_data": test_user}
                )
                return False
            
            registration_data = registration_response.json()
            print(f"✅ Registration successful. User ID: {registration_data.get('id')}, User Number: {registration_data.get('user_number')}")
            
            # Step 2: Immediate login with email
            print(f"🔐 Step 2: Attempting login with email {test_user['email']}...")
            
            login_data = {
                "email_or_id": test_user["email"],
                "password": test_user["password"]
            }
            
            login_response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if login_response.status_code != 200:
                self.log_test(
                    "Kayıt Sonrası Email Girişi",
                    False,
                    f"Email login failed with status {login_response.status_code}",
                    {
                        "login_data": login_data,
                        "response": login_response.text,
                        "registration_data": registration_data
                    }
                )
                return False
            
            login_result = login_response.json()
            
            if "access_token" not in login_result or "user" not in login_result:
                self.log_test(
                    "Kayıt Sonrası Email Girişi",
                    False,
                    "Login response missing access_token or user data",
                    {"response": login_result}
                )
                return False
            
            print(f"✅ Email login successful. Token received.")
            
            # Step 3: Login with user number (ID)
            user_number = registration_data.get('user_number')
            if user_number is not None:
                print(f"🔐 Step 3: Attempting login with user number {user_number}...")
                
                id_login_data = {
                    "email_or_id": str(user_number),
                    "password": test_user["password"]
                }
                
                id_login_response = self.session.post(f"{API_BASE}/auth/login", json=id_login_data)
                
                if id_login_response.status_code != 200:
                    self.log_test(
                        "Kayıt Sonrası ID Girişi",
                        False,
                        f"ID login failed with status {id_login_response.status_code}",
                        {
                            "login_data": id_login_data,
                            "response": id_login_response.text
                        }
                    )
                    return False
                
                id_login_result = id_login_response.json()
                
                if "access_token" not in id_login_result:
                    self.log_test(
                        "Kayıt Sonrası ID Girişi",
                        False,
                        "ID login response missing access_token",
                        {"response": id_login_result}
                    )
                    return False
                
                print(f"✅ ID login successful with user number {user_number}")
            
            self.log_test(
                "Yeni Kullanıcı Kayıt ve Giriş",
                True,
                f"User {test_user['email']} successfully registered and can login with both email and ID"
            )
            
            return {
                "user_data": registration_data,
                "email_login": login_result,
                "id_login": id_login_result if user_number is not None else None
            }
            
        except Exception as e:
            self.log_test(
                "Yeni Kullanıcı Kayıt ve Giriş",
                False,
                f"Exception during registration/login test: {str(e)}"
            )
            return False
    
    def test_password_hash_verification(self, user_email: str):
        """Test 2: Şifre Hash Kontrolü"""
        print("\n🧪 TEST 2: ŞİFRE HASH KONTROLÜ")
        print("=" * 50)
        
        if not self.admin_token:
            self.log_test(
                "Şifre Hash Kontrolü",
                False,
                "Admin token not available for database verification"
            )
            return False
        
        try:
            # Get user list to find our test user
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            users_response = self.session.get(f"{API_BASE}/users", headers=headers)
            
            if users_response.status_code != 200:
                self.log_test(
                    "Şifre Hash Kontrolü",
                    False,
                    f"Failed to get users list: {users_response.status_code}",
                    {"response": users_response.text}
                )
                return False
            
            users = users_response.json()
            test_user = None
            
            for user in users:
                if user.get('email') == user_email:
                    test_user = user
                    break
            
            if not test_user:
                self.log_test(
                    "Şifre Hash Kontrolü",
                    False,
                    f"Test user {user_email} not found in database"
                )
                return False
            
            # Check if password field exists and is not empty
            if 'password' not in test_user:
                self.log_test(
                    "Şifre Hash Kontrolü",
                    False,
                    "Password field missing from user data in database",
                    {"user_data": test_user}
                )
                return False
            
            password_hash = test_user.get('password', '')
            
            if not password_hash:
                self.log_test(
                    "Şifre Hash Kontrolü",
                    False,
                    "Password field is empty in database",
                    {"user_data": test_user}
                )
                return False
            
            # Check if password looks like a bcrypt hash
            if not password_hash.startswith('$2b$'):
                self.log_test(
                    "Şifre Hash Kontrolü",
                    False,
                    "Password doesn't appear to be properly hashed (not bcrypt format)",
                    {"password_hash": password_hash[:20] + "..."}
                )
                return False
            
            print(f"✅ Password properly hashed with bcrypt")
            print(f"   Hash format: {password_hash[:20]}...")
            print(f"   Hash length: {len(password_hash)} characters")
            
            self.log_test(
                "Şifre Hash Kontrolü",
                True,
                "Password is properly hashed and stored in database"
            )
            return True
            
        except Exception as e:
            self.log_test(
                "Şifre Hash Kontrolü",
                False,
                f"Exception during password hash verification: {str(e)}"
            )
            return False
    
    def test_user_data_completeness(self, user_email: str):
        """Test 3: Kayıt Sonrası Kullanıcı Verisi"""
        print("\n🧪 TEST 3: KAYIT SONRASI KULLANICI VERİSİ")
        print("=" * 50)
        
        if not self.admin_token:
            self.log_test(
                "Kullanıcı Verisi Kontrolü",
                False,
                "Admin token not available"
            )
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            users_response = self.session.get(f"{API_BASE}/users", headers=headers)
            
            if users_response.status_code != 200:
                self.log_test(
                    "Kullanıcı Verisi Kontrolü",
                    False,
                    f"Failed to get users: {users_response.status_code}"
                )
                return False
            
            users = users_response.json()
            test_user = None
            
            for user in users:
                if user.get('email') == user_email:
                    test_user = user
                    break
            
            if not test_user:
                self.log_test(
                    "Kullanıcı Verisi Kontrolü",
                    False,
                    f"User {user_email} not found"
                )
                return False
            
            # Check required fields
            required_fields = ['id', 'email', 'password', 'user_number', 'name', 'role']
            missing_fields = []
            
            for field in required_fields:
                if field not in test_user or test_user[field] is None:
                    missing_fields.append(field)
            
            if missing_fields:
                self.log_test(
                    "Kullanıcı Verisi Kontrolü",
                    False,
                    f"Missing required fields: {missing_fields}",
                    {"user_data": test_user}
                )
                return False
            
            print(f"✅ All required fields present:")
            for field in required_fields:
                value = test_user[field]
                if field == 'password':
                    value = value[:10] + "..." if len(value) > 10 else value
                print(f"   {field}: {value}")
            
            self.log_test(
                "Kullanıcı Verisi Kontrolü",
                True,
                "All required user fields are present and populated"
            )
            return True
            
        except Exception as e:
            self.log_test(
                "Kullanıcı Verisi Kontrolü",
                False,
                f"Exception during user data verification: {str(e)}"
            )
            return False
    
    def test_login_error_scenarios(self, user_email: str, correct_password: str):
        """Test 4: Giriş Hata Senaryoları"""
        print("\n🧪 TEST 4: GİRİŞ HATA SENARYOLARİ")
        print("=" * 50)
        
        try:
            # Test 1: Wrong password
            print("🔐 Testing wrong password...")
            wrong_login = {
                "email_or_id": user_email,
                "password": "wrongpassword123"
            }
            
            wrong_response = self.session.post(f"{API_BASE}/auth/login", json=wrong_login)
            
            if wrong_response.status_code == 200:
                self.log_test(
                    "Yanlış Şifre Testi",
                    False,
                    "Login succeeded with wrong password - security issue!",
                    {"response": wrong_response.json()}
                )
                return False
            elif wrong_response.status_code == 401:
                print("✅ Wrong password correctly rejected")
            else:
                print(f"⚠️  Unexpected status code for wrong password: {wrong_response.status_code}")
            
            # Test 2: Correct password
            print("🔐 Testing correct password...")
            correct_login = {
                "email_or_id": user_email,
                "password": correct_password
            }
            
            correct_response = self.session.post(f"{API_BASE}/auth/login", json=correct_login)
            
            if correct_response.status_code != 200:
                self.log_test(
                    "Doğru Şifre Testi",
                    False,
                    f"Login failed with correct password: {correct_response.status_code}",
                    {"response": correct_response.text}
                )
                return False
            
            correct_data = correct_response.json()
            if "access_token" not in correct_data:
                self.log_test(
                    "Doğru Şifre Testi",
                    False,
                    "Login successful but no access token returned",
                    {"response": correct_data}
                )
                return False
            
            print("✅ Correct password login successful")
            
            # Test 3: Non-existent user
            print("🔐 Testing non-existent user...")
            nonexistent_login = {
                "email_or_id": "nonexistent@example.com",
                "password": "anypassword"
            }
            
            nonexistent_response = self.session.post(f"{API_BASE}/auth/login", json=nonexistent_login)
            
            if nonexistent_response.status_code == 200:
                self.log_test(
                    "Olmayan Kullanıcı Testi",
                    False,
                    "Login succeeded for non-existent user - security issue!",
                    {"response": nonexistent_response.json()}
                )
                return False
            elif nonexistent_response.status_code == 401:
                print("✅ Non-existent user correctly rejected")
            
            self.log_test(
                "Giriş Hata Senaryoları",
                True,
                "All login error scenarios handled correctly"
            )
            return True
            
        except Exception as e:
            self.log_test(
                "Giriş Hata Senaryoları",
                False,
                f"Exception during login error testing: {str(e)}"
            )
            return False
    
    def test_database_persistence(self, user_email: str):
        """Test 5: Veritabanı Kontrol"""
        print("\n🧪 TEST 5: VERİTABANI KONTROL")
        print("=" * 50)
        
        if not self.admin_token:
            self.log_test(
                "Veritabanı Kontrol",
                False,
                "Admin token not available"
            )
            return False
        
        try:
            # Wait a moment for database consistency
            time.sleep(1)
            
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            users_response = self.session.get(f"{API_BASE}/users", headers=headers)
            
            if users_response.status_code != 200:
                self.log_test(
                    "Veritabanı Kontrol",
                    False,
                    f"Failed to query database: {users_response.status_code}"
                )
                return False
            
            users = users_response.json()
            test_user = None
            
            for user in users:
                if user.get('email') == user_email:
                    test_user = user
                    break
            
            if not test_user:
                self.log_test(
                    "Veritabanı Kontrol",
                    False,
                    f"User {user_email} not found in database after registration"
                )
                return False
            
            print(f"✅ User found in database")
            
            # Check password field specifically
            if 'password' not in test_user or not test_user['password']:
                self.log_test(
                    "Veritabanı Kontrol",
                    False,
                    "Password field is missing or empty in database",
                    {"user_data": test_user}
                )
                return False
            
            print(f"✅ Password field is present and not empty")
            print(f"   Password hash length: {len(test_user['password'])} characters")
            
            # Check other critical fields
            critical_fields = ['id', 'name', 'email', 'role', 'user_number']
            for field in critical_fields:
                if field not in test_user or test_user[field] is None:
                    self.log_test(
                        "Veritabanı Kontrol",
                        False,
                        f"Critical field '{field}' is missing or null",
                        {"user_data": test_user}
                    )
                    return False
                print(f"   {field}: {test_user[field]}")
            
            self.log_test(
                "Veritabanı Kontrol",
                True,
                "User is properly saved in database with all required fields"
            )
            return True
            
        except Exception as e:
            self.log_test(
                "Veritabanı Kontrol",
                False,
                f"Exception during database verification: {str(e)}"
            )
            return False
    
    def cleanup_test_user(self, user_email: str):
        """Clean up test user after testing"""
        if not self.admin_token:
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            users_response = self.session.get(f"{API_BASE}/users", headers=headers)
            
            if users_response.status_code == 200:
                users = users_response.json()
                for user in users:
                    if user.get('email') == user_email:
                        # Delete test user
                        delete_response = self.session.delete(
                            f"{API_BASE}/users/{user['id']}", 
                            headers=headers
                        )
                        if delete_response.status_code == 200:
                            print(f"🧹 Test user {user_email} cleaned up")
                        break
        except Exception:
            pass  # Cleanup is best effort
    
    def run_comprehensive_test(self):
        """Run all registration and login tests"""
        print("🚀 KAYIT VE GİRİŞ SORUNU DETAYLI TEST")
        print("Backend URL:", BACKEND_URL)
        print("=" * 60)
        
        # Get admin token first
        if not self.get_admin_token():
            print("❌ Cannot proceed without admin token")
            return False
        
        # Test 1: Registration and immediate login
        registration_result = self.test_new_user_registration_and_login()
        
        if not registration_result:
            print("❌ Registration test failed - cannot proceed with other tests")
            return False
        
        test_email = "newtestuser@example.com"
        test_password = "newtest123"
        
        # Test 2: Password hash verification
        self.test_password_hash_verification(test_email)
        
        # Test 3: User data completeness
        self.test_user_data_completeness(test_email)
        
        # Test 4: Login error scenarios
        self.test_login_error_scenarios(test_email, test_password)
        
        # Test 5: Database persistence
        self.test_database_persistence(test_email)
        
        # Cleanup
        self.cleanup_test_user(test_email)
        
        # Summary
        print("\n" + "=" * 60)
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
        
        return len(failed_tests) == 0

def main():
    """Main test execution"""
    tester = RegistrationLoginTester()
    success = tester.run_comprehensive_test()
    
    if success:
        print("\n🎉 YENİ KULLANICI KAYIT VE GİRİŞ SİSTEMİ TAM ÇALIŞIYOR!")
        sys.exit(0)
    else:
        print("\n💥 YENİ KULLANICI KAYIT/GİRİŞ SORUNLARI TESPİT EDİLDİ!")
        sys.exit(1)

if __name__ == "__main__":
    main()