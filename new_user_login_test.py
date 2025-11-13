#!/usr/bin/env python3
"""
YENİ KULLANICI KAYIT VE GİRİŞ SORUNU TESTİ
Kullanıcı bildiriyor: "oluşan kullanıcılar giriş yapamıyor hala"

Test Senaryosu:
1. Yeni kullanıcı kaydı (POST /api/auth/register)
2. Yeni kullanıcı ile giriş (POST /api/auth/login)
3. ID ile giriş testi
4. Şifre hashleme kontrolü
5. Detaylı hata analizi
"""

import requests
import json
import sys
import time
import hashlib
from typing import Dict, Any

# Backend URL
BACKEND_URL = "https://focuspro-revamp.preview.emergentagent.com"
API_BASE = f"{BACKEND_URL}/api"

class NewUserLoginTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.test_user_email = "testuser@example.com"
        self.test_user_password = "test123"
        self.test_user_name = "Test User"
        self.created_user_id = None
        self.created_user_number = None
        
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
    
    def cleanup_test_user(self):
        """Clean up test user if it exists"""
        try:
            # First login as admin to get admin token
            admin_login_data = {
                "email_or_id": "admin@focuspro.com",
                "password": "admin123"
            }
            
            admin_response = self.session.post(f"{API_BASE}/auth/login", json=admin_login_data)
            if admin_response.status_code == 200:
                admin_data = admin_response.json()
                admin_token = admin_data["access_token"]
                headers = {"Authorization": f"Bearer {admin_token}"}
                
                # Get all users
                users_response = self.session.get(f"{API_BASE}/users", headers=headers)
                if users_response.status_code == 200:
                    users = users_response.json()
                    
                    # Find and delete test user
                    for user in users:
                        if user.get('email') == self.test_user_email:
                            delete_response = self.session.delete(f"{API_BASE}/users/{user['id']}", headers=headers)
                            if delete_response.status_code == 200:
                                print(f"   Cleaned up existing test user: {self.test_user_email}")
                            break
        except Exception as e:
            print(f"   Warning: Could not cleanup test user: {str(e)}")
    
    def test_new_user_registration(self):
        """Test 1: Yeni kullanıcı kaydı"""
        print("\n🔍 TEST 1: YENİ KULLANICI KAYDI")
        
        # First cleanup any existing test user
        self.cleanup_test_user()
        
        try:
            user_data = {
                "name": self.test_user_name,
                "email": self.test_user_email,
                "password": self.test_user_password,
                "role": "user"
            }
            
            print(f"   Registering user: {self.test_user_email}")
            response = self.session.post(f"{API_BASE}/auth/register", json=user_data)
            
            print(f"   Response Status: {response.status_code}")
            print(f"   Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   Response Data: {json.dumps(data, indent=2)}")
                
                # Check required fields
                required_fields = ['id', 'name', 'email', 'role', 'user_number']
                missing_fields = []
                
                for field in required_fields:
                    if field not in data:
                        missing_fields.append(field)
                
                if missing_fields:
                    self.log_test(
                        "Yeni Kullanıcı Kaydı", 
                        False, 
                        f"Kayıt başarılı ama gerekli alanlar eksik: {missing_fields}",
                        {"response": data, "missing_fields": missing_fields}
                    )
                    return False
                
                # Store user info for subsequent tests
                self.created_user_id = data['id']
                self.created_user_number = data.get('user_number')
                
                self.log_test(
                    "Yeni Kullanıcı Kaydı", 
                    True, 
                    f"Kullanıcı başarıyla kaydedildi. ID: {self.created_user_id}, User Number: {self.created_user_number}"
                )
                return True
            else:
                error_text = response.text
                try:
                    error_data = response.json()
                    error_text = json.dumps(error_data, indent=2)
                except:
                    pass
                
                self.log_test(
                    "Yeni Kullanıcı Kaydı", 
                    False, 
                    f"Kayıt başarısız. Status: {response.status_code}",
                    {"response": error_text}
                )
                return False
                
        except Exception as e:
            self.log_test(
                "Yeni Kullanıcı Kaydı", 
                False, 
                f"Exception during registration: {str(e)}"
            )
            return False
    
    def test_new_user_email_login(self):
        """Test 2: Yeni kullanıcı ile email girişi"""
        print("\n🔍 TEST 2: YENİ KULLANICI EMAIL GİRİŞİ")
        
        if not self.created_user_id:
            self.log_test(
                "Yeni Kullanıcı Email Girişi", 
                False, 
                "Kullanıcı kaydı başarısız olduğu için test yapılamıyor"
            )
            return False
        
        try:
            login_data = {
                "email_or_id": self.test_user_email,
                "password": self.test_user_password
            }
            
            print(f"   Attempting login with email: {self.test_user_email}")
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            print(f"   Response Status: {response.status_code}")
            print(f"   Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   Response Data: {json.dumps(data, indent=2)}")
                
                # Check required fields in login response
                if "access_token" in data and "user" in data:
                    user_info = data["user"]
                    
                    # Verify user information
                    if (user_info.get('email') == self.test_user_email and 
                        user_info.get('name') == self.test_user_name):
                        
                        self.log_test(
                            "Yeni Kullanıcı Email Girişi", 
                            True, 
                            f"Email girişi başarılı. Token alındı, kullanıcı bilgileri doğru."
                        )
                        return data["access_token"]
                    else:
                        self.log_test(
                            "Yeni Kullanıcı Email Girişi", 
                            False, 
                            "Giriş başarılı ama kullanıcı bilgileri yanlış",
                            {"expected_email": self.test_user_email, "got_email": user_info.get('email'),
                             "expected_name": self.test_user_name, "got_name": user_info.get('name')}
                        )
                else:
                    self.log_test(
                        "Yeni Kullanıcı Email Girişi", 
                        False, 
                        "Giriş response'unda access_token veya user bilgisi eksik",
                        {"response": data}
                    )
            else:
                error_text = response.text
                try:
                    error_data = response.json()
                    error_text = json.dumps(error_data, indent=2)
                except:
                    pass
                
                self.log_test(
                    "Yeni Kullanıcı Email Girişi", 
                    False, 
                    f"Email girişi başarısız. Status: {response.status_code}",
                    {"response": error_text, "login_data": login_data}
                )
                
        except Exception as e:
            self.log_test(
                "Yeni Kullanıcı Email Girişi", 
                False, 
                f"Exception during email login: {str(e)}"
            )
        
        return False
    
    def test_new_user_id_login(self):
        """Test 3: Yeni kullanıcı ile ID girişi"""
        print("\n🔍 TEST 3: YENİ KULLANICI ID GİRİŞİ")
        
        if not self.created_user_number:
            self.log_test(
                "Yeni Kullanıcı ID Girişi", 
                False, 
                "User number bilgisi yok, ID girişi test edilemiyor"
            )
            return False
        
        try:
            login_data = {
                "email_or_id": str(self.created_user_number),
                "password": self.test_user_password
            }
            
            print(f"   Attempting login with ID: {self.created_user_number}")
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            print(f"   Response Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   Response Data: {json.dumps(data, indent=2)}")
                
                if "access_token" in data and "user" in data:
                    user_info = data["user"]
                    
                    if (user_info.get('email') == self.test_user_email and 
                        user_info.get('user_number') == self.created_user_number):
                        
                        self.log_test(
                            "Yeni Kullanıcı ID Girişi", 
                            True, 
                            f"ID girişi başarılı. User Number: {self.created_user_number}"
                        )
                        return data["access_token"]
                    else:
                        self.log_test(
                            "Yeni Kullanıcı ID Girişi", 
                            False, 
                            "ID girişi başarılı ama kullanıcı bilgileri yanlış",
                            {"expected_user_number": self.created_user_number, 
                             "got_user_number": user_info.get('user_number')}
                        )
                else:
                    self.log_test(
                        "Yeni Kullanıcı ID Girişi", 
                        False, 
                        "ID giriş response'unda access_token veya user bilgisi eksik",
                        {"response": data}
                    )
            else:
                error_text = response.text
                try:
                    error_data = response.json()
                    error_text = json.dumps(error_data, indent=2)
                except:
                    pass
                
                self.log_test(
                    "Yeni Kullanıcı ID Girişi", 
                    False, 
                    f"ID girişi başarısız. Status: {response.status_code}",
                    {"response": error_text, "login_data": login_data}
                )
                
        except Exception as e:
            self.log_test(
                "Yeni Kullanıcı ID Girişi", 
                False, 
                f"Exception during ID login: {str(e)}"
            )
        
        return False
    
    def test_password_hashing_verification(self):
        """Test 4: Şifre hashleme kontrolü"""
        print("\n🔍 TEST 4: ŞİFRE HASHLEME KONTROLÜ")
        
        if not self.created_user_id:
            self.log_test(
                "Şifre Hashleme Kontrolü", 
                False, 
                "Kullanıcı kaydı başarısız olduğu için test yapılamıyor"
            )
            return False
        
        try:
            # Login as admin to access user data
            admin_login_data = {
                "email_or_id": "admin@focuspro.com",
                "password": "admin123"
            }
            
            admin_response = self.session.post(f"{API_BASE}/auth/login", json=admin_login_data)
            if admin_response.status_code != 200:
                self.log_test(
                    "Şifre Hashleme Kontrolü", 
                    False, 
                    "Admin girişi başarısız, şifre kontrolü yapılamıyor"
                )
                return False
            
            admin_data = admin_response.json()
            admin_token = admin_data["access_token"]
            headers = {"Authorization": f"Bearer {admin_token}"}
            
            # Get all users to find our test user
            users_response = self.session.get(f"{API_BASE}/users", headers=headers)
            if users_response.status_code != 200:
                self.log_test(
                    "Şifre Hashleme Kontrolü", 
                    False, 
                    "Kullanıcı listesi alınamadı"
                )
                return False
            
            users = users_response.json()
            test_user = None
            
            for user in users:
                if user.get('email') == self.test_user_email:
                    test_user = user
                    break
            
            if not test_user:
                self.log_test(
                    "Şifre Hashleme Kontrolü", 
                    False, 
                    "Test kullanıcısı veritabanında bulunamadı"
                )
                return False
            
            print(f"   Test kullanıcısı bulundu: {test_user.get('name')} ({test_user.get('email')})")
            
            # Test wrong password
            wrong_login_data = {
                "email_or_id": self.test_user_email,
                "password": "wrongpassword123"
            }
            
            wrong_response = self.session.post(f"{API_BASE}/auth/login", json=wrong_login_data)
            
            if wrong_response.status_code == 401:
                print("   ✅ Yanlış şifre ile giriş reddedildi (doğru)")
                
                # Test correct password again
                correct_login_data = {
                    "email_or_id": self.test_user_email,
                    "password": self.test_user_password
                }
                
                correct_response = self.session.post(f"{API_BASE}/auth/login", json=correct_login_data)
                
                if correct_response.status_code == 200:
                    self.log_test(
                        "Şifre Hashleme Kontrolü", 
                        True, 
                        "Şifre hashleme ve doğrulama sistemi çalışıyor. Yanlış şifre reddedildi, doğru şifre kabul edildi."
                    )
                    return True
                else:
                    self.log_test(
                        "Şifre Hashleme Kontrolü", 
                        False, 
                        f"Doğru şifre ile giriş başarısız. Status: {correct_response.status_code}",
                        {"response": correct_response.text}
                    )
            else:
                self.log_test(
                    "Şifre Hashleme Kontrolü", 
                    False, 
                    f"Yanlış şifre ile giriş reddedilmedi! Status: {wrong_response.status_code}",
                    {"response": wrong_response.text}
                )
                
        except Exception as e:
            self.log_test(
                "Şifre Hashleme Kontrolü", 
                False, 
                f"Exception during password verification: {str(e)}"
            )
        
        return False
    
    def test_admin_login_verification(self):
        """Test 5: Admin hesabının çalıştığını doğrula"""
        print("\n🔍 TEST 5: ADMİN HESAP DOĞRULAMA")
        
        try:
            admin_login_data = {
                "email_or_id": "admin@focuspro.com",
                "password": "admin123"
            }
            
            print("   Testing admin login...")
            response = self.session.post(f"{API_BASE}/auth/login", json=admin_login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    user_info = data["user"]
                    if user_info.get('role') == 'admin':
                        self.log_test(
                            "Admin Hesap Doğrulama", 
                            True, 
                            f"Admin hesabı çalışıyor. Admin: {user_info.get('name')}"
                        )
                        return True
                    else:
                        self.log_test(
                            "Admin Hesap Doğrulama", 
                            False, 
                            f"Admin girişi başarılı ama role yanlış: {user_info.get('role')}"
                        )
                else:
                    self.log_test(
                        "Admin Hesap Doğrulama", 
                        False, 
                        "Admin giriş response'unda gerekli alanlar eksik",
                        {"response": data}
                    )
            else:
                self.log_test(
                    "Admin Hesap Doğrulama", 
                    False, 
                    f"Admin girişi başarısız. Status: {response.status_code}",
                    {"response": response.text}
                )
                
        except Exception as e:
            self.log_test(
                "Admin Hesap Doğrulama", 
                False, 
                f"Exception during admin login: {str(e)}"
            )
        
        return False
    
    def run_comprehensive_test(self):
        """Kapsamlı test senaryosu çalıştır"""
        print("🚀 YENİ KULLANICI KAYIT VE GİRİŞ SORUNU TESTİ")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 70)
        
        # Test 5: Admin hesabının çalıştığını doğrula
        admin_working = self.test_admin_login_verification()
        
        # Test 1: Yeni kullanıcı kaydı
        registration_success = self.test_new_user_registration()
        
        # Test 2: Email ile giriş
        email_login_token = None
        if registration_success:
            email_login_token = self.test_new_user_email_login()
        
        # Test 3: ID ile giriş
        id_login_token = None
        if registration_success:
            id_login_token = self.test_new_user_id_login()
        
        # Test 4: Şifre hashleme kontrolü
        password_hashing_ok = False
        if registration_success:
            password_hashing_ok = self.test_password_hashing_verification()
        
        print("\n" + "=" * 70)
        print("📊 TEST SONUÇLARI:")
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        
        print(f"Toplam Test: {total_tests}")
        print(f"Başarılı: {passed_tests}")
        print(f"Başarısız: {total_tests - passed_tests}")
        print(f"Başarı Oranı: {(passed_tests/total_tests)*100:.1f}%")
        
        # Kritik sorunlar
        critical_issues = []
        
        if not admin_working:
            critical_issues.append("❌ Admin hesabı çalışmıyor")
        else:
            print("✅ Admin hesabı çalışıyor")
        
        if not registration_success:
            critical_issues.append("❌ Yeni kullanıcı kaydı başarısız")
        else:
            print("✅ Yeni kullanıcı kaydı başarılı")
        
        if registration_success and not email_login_token:
            critical_issues.append("❌ Yeni kullanıcı email ile giriş yapamıyor")
        elif email_login_token:
            print("✅ Yeni kullanıcı email ile giriş yapabiliyor")
        
        if registration_success and not id_login_token:
            critical_issues.append("❌ Yeni kullanıcı ID ile giriş yapamıyor")
        elif id_login_token:
            print("✅ Yeni kullanıcı ID ile giriş yapabiliyor")
        
        if registration_success and not password_hashing_ok:
            critical_issues.append("❌ Şifre hashleme/doğrulama sistemi çalışmıyor")
        elif password_hashing_ok:
            print("✅ Şifre hashleme/doğrulama sistemi çalışıyor")
        
        if critical_issues:
            print("\n🚨 KRİTİK SORUNLAR:")
            for issue in critical_issues:
                print(f"   {issue}")
        else:
            print("\n🎉 TÜM TESTLER BAŞARILI!")
            print("   Yeni kullanıcılar kayıt olup giriş yapabiliyorlar.")
        
        # Cleanup
        print("\n🧹 Test kullanıcısı temizleniyor...")
        self.cleanup_test_user()
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "success_rate": (passed_tests/total_tests)*100,
            "critical_issues": critical_issues,
            "admin_working": admin_working,
            "registration_success": registration_success,
            "email_login_success": bool(email_login_token),
            "id_login_success": bool(id_login_token),
            "password_hashing_ok": password_hashing_ok,
            "all_results": self.test_results
        }

def main():
    """Ana test fonksiyonu"""
    tester = NewUserLoginTester()
    results = tester.run_comprehensive_test()
    
    # Kritik testler başarısız ise hata kodu ile çık
    if results["critical_issues"]:
        sys.exit(1)
    elif results["success_rate"] < 80:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()