import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet, Text, View, ScrollView, TouchableOpacity,
    SafeAreaView, Linking, StatusBar,
    TextInput, Modal, Image, Alert, Animated, Easing, Dimensions, Platform
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as SecureStore from 'expo-secure-store';
import { driversAPI, requestsAPI, authAPI, driverFakeNotificationsAPI } from './src/services/api';

const WINDOW_WIDTH = Dimensions.get('window').width;

const provincesByRegion: Record<string, string[]> = {
    north: ['Hà Nội', 'Hải Phòng', 'Hải Dương', 'Hưng Yên', 'Thái Bình', 'Hà Nam', 'Nam Định', 'Ninh Bình', 'Vĩnh Phúc', 'Bắc Ninh', 'Quảng Ninh', 'Lạng Sơn', 'Cao Bằng', 'Bắc Kạn', 'Thái Nguyên', 'Tuyên Quang', 'Hà Giang', 'Lào Cai', 'Yên Bái', 'Lai Châu', 'Điện Biên', 'Sơn La', 'Hòa Bình', 'Phú Thọ', 'Bắc Giang'],
    central: ['Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Thừa Thiên - Huế', 'Đà Nẵng', 'Quảng Nam', 'Quảng Ngãi', 'Bình Định', 'Phú Yên', 'Khánh Hòa', 'Ninh Thuận', 'Bình Thuận', 'Kon Tum', 'Gia Lai', 'Đắk Lắk', 'Đắk Nông', 'Lâm Đồng'],
    south: ['TP. Hồ Chí Minh', 'Bình Dương', 'Đồng Nai', 'Bà Rịa-Vũng Tàu', 'Tây Ninh', 'Bình Phước', 'Long An', 'Tiền Giang', 'Bến Tre', 'Trà Vinh', 'Vĩnh Long', 'Đồng Tháp', 'An Giang', 'Kiên Giang', 'Cần Thơ', 'Hậu Giang', 'Sóc Trăng', 'Bạc Liêu', 'Cà Mau']
};

const provincesVN63 = [...provincesByRegion.north, ...provincesByRegion.central, ...provincesByRegion.south].sort();

type Region = 'north' | 'central' | 'south';

const regionLabels: Record<Region, string> = {
    north: 'Miền Bắc',
    central: 'Miền Trung',
    south: 'Miền Nam'
};

// Ticker Component
const Ticker = ({ items }: { items: any[] }) => {
    const scrollX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (items.length === 0) return;
        const animate = () => {
            scrollX.setValue(WINDOW_WIDTH);
            Animated.timing(scrollX, {
                toValue: -WINDOW_WIDTH * 2,
                duration: 15000,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(() => animate());
        };
        animate();
    }, [items]);

    if (items.length === 0) return null;

    return (
        <View style={styles.tickerContainer}>
            <Animated.View style={{ transform: [{ translateX: scrollX }], flexDirection: 'row' }}>
                <Text style={styles.tickerText}>
                    {items.map(i => ` • ${i.name} đang nhờ: ${i.route} - LH: ${i.phone?.slice(0, 6)}xxxx `).join('')}
                </Text>
            </Animated.View>
        </View>
    );
};

export default function App() {
    const [user, setUser] = useState<any>(null);
    const [activeRequestRegion, setActiveRequestRegion] = useState<Region>('north');
    const [activeDriverRegion, setActiveDriverRegion] = useState<Region>('north');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [drivers, setDrivers] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Modals
    const [authModal, setAuthModal] = useState<'login' | 'register' | null>(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [callSheet, setCallSheet] = useState<{ phone: string } | null>(null);

    // Forms
    const [authForm, setAuthForm] = useState({ name: '', phone: '', password: '', confirmPassword: '', carType: '', carYear: '' });
    const [requestForm, setRequestForm] = useState({ name: '', phone: '', startPoint: '', endPoint: '', price: '', note: '', region: 'north' as Region });

    // Fake Notifications State
    const [fakeNotification, setFakeNotification] = useState<any>(null);
    const [showFakeError, setShowFakeError] = useState(false);
    const [fakeErrorMessage, setFakeErrorMessage] = useState('');
    const [acceptingFake, setAcceptingFake] = useState(false);
    const fakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Fake notifications logic
    const fetchFakeNotifications = async (currentUser?: any, region?: Region) => {
        const u = currentUser || user;
        if (!u || u.status !== 'approved') return;

        try {
            const currentRegion = region || activeDriverRegion;
            const response = await driverFakeNotificationsAPI.getNotifications(currentRegion);
            const notifications = response.data.data || [];
            
            if (notifications.length > 0) {
                const randomNotif = notifications[Math.floor(Math.random() * notifications.length)];
                setFakeNotification(randomNotif);
            }

            if (fakeTimeoutRef.current) clearTimeout(fakeTimeoutRef.current);
            
            let min = 15;
            let max = 30;
            if (response.data.settings) {
                min = response.data.settings.minInterval || 15;
                max = response.data.settings.maxInterval || 30;
            }
            
            const randomMinutes = Math.floor(Math.random() * (max - min + 1)) + min;
            fakeTimeoutRef.current = setTimeout(() => {
                fetchFakeNotifications(u, currentRegion);
            }, randomMinutes * 60 * 1000);

        } catch (error) {
            console.error('[API] Error fetching fake notifications:', error);
        }
    };

    useEffect(() => {
        if (user && user.status === 'approved') {
            fetchFakeNotifications(user, activeDriverRegion);
        }
        return () => {
            if (fakeTimeoutRef.current) clearTimeout(fakeTimeoutRef.current);
        };
    }, [user?.status, activeDriverRegion]);

    const handleAcceptFake = async () => {
        if (!fakeNotification) return;
        setAcceptingFake(true);
        try {
            await driverFakeNotificationsAPI.acceptNotification(fakeNotification._id);
        } catch (error: any) {
            setFakeNotification(null); // Hide popup
            setFakeErrorMessage(error.response?.data?.message || 'Đã có tài xế nhận quốc, vui lòng đợi cuốc tiếp theo');
            setShowFakeError(true);
        } finally {
            setAcceptingFake(false);
        }
    };

    useEffect(() => {
        console.log('[App] Mounting - calling checkAuth and loadData');
        checkAuth();
        loadData(); // Call immediately on mount
    }, []);

    useEffect(() => {
        console.log('[App] Region changed - reloading data', { activeDriverRegion, activeRequestRegion });
        loadData();
    }, [activeRequestRegion, activeDriverRegion, selectedProvince]);

    const checkAuth = async () => {
        try {
            // SecureStore only works on native, not web
            if (Platform.OS === 'web') {
                console.log('[Auth] Running on web, skipping SecureStore');
                return;
            }
            const userData = await SecureStore.getItemAsync('userData');
            if (userData) setUser(JSON.parse(userData));
        } catch (e) {
            console.error('[Auth] Error checking auth:', e);
        }
    };

    const loadData = async () => {
        console.log('[API] Loading data...');
        try {
            const [driversRes, requestsRes] = await Promise.all([
                driversAPI.getDrivers(activeDriverRegion),
                requestsAPI.getRequests(activeRequestRegion)
            ]);
            console.log('[API] Drivers result:', driversRes.data?.drivers?.length, 'drivers');
            console.log('[API] Requests result:', requestsRes.data?.requests?.length, 'requests');

            setDrivers(driversRes.data?.drivers || []);

            let filteredRequests = requestsRes.data?.requests || [];
            if (selectedProvince) {
                filteredRequests = filteredRequests.filter((r: any) =>
                    r.startPoint?.includes(selectedProvince) || r.endPoint?.includes(selectedProvince)
                );
            }
            setRequests(filteredRequests);
        } catch (error) {
            console.error("[API] Lỗi tải dữ liệu:", error);
        }
    };

    const handleLogin = async () => {
        if (!authForm.phone || !authForm.password) return Alert.alert("Lỗi", "Vui lòng nhập đủ thông tin");
        setLoading(true);
        try {
            const res = await authAPI.login({ phone: authForm.phone, password: authForm.password });
            await SecureStore.setItemAsync('userToken', res.data.token);
            await SecureStore.setItemAsync('userData', JSON.stringify(res.data.user));
            setUser(res.data.user);
            setAuthModal(null);
            setAuthForm({ name: '', phone: '', password: '', confirmPassword: '', carType: '', carYear: '' });
            Alert.alert("Thành công", "Đăng nhập thành công!");
        } catch (error: any) {
            const msg = error.response?.data?.message || "Đăng nhập thất bại";
            if (error.response?.status === 403) {
                Alert.alert("Thông báo", "Tài khoản đang chờ phê duyệt. Vui lòng đợi admin xác nhận.");
            } else {
                Alert.alert("Lỗi", msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = () => {
        if (!authForm.name || !authForm.phone || !authForm.password || !authForm.carType || !authForm.carYear) {
            return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
        }
        if (authForm.password !== authForm.confirmPassword) {
            return Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
        }
        setShowPayment(true);
    };

    const confirmRegister = async () => {
        setLoading(true);
        try {
            await authAPI.register(authForm);
            Alert.alert("Thành công", "Đăng ký thành công! Vui lòng chờ admin phê duyệt tài khoản.");
            setShowPayment(false);
            setAuthModal(null);
            setAuthForm({ name: '', phone: '', password: '', confirmPassword: '', carType: '', carYear: '' });
        } catch (error: any) {
            Alert.alert("Lỗi", error.response?.data?.message || "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRequest = async () => {
        if (!requestForm.name || !requestForm.phone || !requestForm.startPoint || !requestForm.endPoint || !requestForm.price) {
            return Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
        }
        setLoading(true);
        try {
            // Tự động xác định region từ startPoint
            const getRegion = (province: string): Region => {
                if (provincesByRegion.north.includes(province)) return 'north';
                if (provincesByRegion.central.includes(province)) return 'central';
                if (provincesByRegion.south.includes(province)) return 'south';
                return activeRequestRegion;
            };
            await requestsAPI.createRequest({
                ...requestForm,
                price: parseInt(requestForm.price),
                region: getRegion(requestForm.startPoint)
            });
            Alert.alert("Thành công", "Đã gửi yêu cầu chở cuốc xe!");
            setShowRequestModal(false);
            setRequestForm({ name: '', phone: '', startPoint: '', endPoint: '', price: '', note: '', region: 'north' });
            loadData();
        } catch (error: any) {
            Alert.alert("Lỗi", error.response?.data?.message || "Gửi yêu cầu thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('userData');
        setUser(null);
    };

    const copyToClipboard = async (item: any) => {
        const text = `${item.name}\n${item.phone}\n${item.startPoint} -> ${item.endPoint}\nGiá: ${item.price?.toLocaleString()}đ`;
        await Clipboard.setStringAsync(text);
        Alert.alert("Đã sao chép", "Thông tin cuốc xe đã được sao chép!");
    };

    const handleCall = (phone: string) => {
        if (!user) {
            Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để liên hệ tài xế");
            setAuthModal('login');
            return;
        }
        setCallSheet({ phone });
    };

    const renderRegionTabs = (current: Region, set: (r: Region) => void) => (
        <View style={styles.tabBar}>
            {(['north', 'central', 'south'] as Region[]).map(r => (
                <TouchableOpacity key={r} onPress={() => { set(r); setSelectedProvince(''); }} style={[styles.tab, current === r && styles.activeTab]}>
                    <Text style={[styles.tabText, current === r && styles.activeTabText]}>{regionLabels[r]}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#2c3e50" />

            {/* Ticker */}
            <Ticker items={drivers.slice(0, 5)} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* User Header */}
                {user ? (
                    <View style={styles.userHeader}>
                        <View style={styles.avatarCircle}><Text style={styles.avatarText}>{user.name?.[0] || 'U'}</Text></View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={{ fontSize: 12, color: '#666' }}>Xin chào,</Text>
                            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{user.name}</Text>
                            <Text style={{ fontSize: 12, color: '#888' }}>{user.phone?.slice(0, 3)}xxx{user.phone?.slice(-3)}</Text>
                        </View>
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                            <Text style={{ color: '#e74c3c', fontWeight: 'bold' }}>🚪 Đăng xuất</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.promoBox}>
                        <Text style={styles.promoTitle}>🚗 Tham gia nhóm tài xế</Text>
                        <Text style={styles.promoSub}>Để liên hệ và đăng cuốc xe</Text>
                        <View style={styles.promoButtons}>
                            <TouchableOpacity style={styles.whiteBtn} onPress={() => setAuthModal('register')}>
                                <Text style={styles.btnTextGreen}>Đăng ký ngay</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.greenBtn} onPress={() => setAuthModal('login')}>
                                <Text style={styles.btnTextWhite}>Đăng nhập</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Requests Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📋 Yêu cầu chở cuốc xe</Text>
                    {renderRegionTabs(activeRequestRegion, setActiveRequestRegion)}

                    <Text style={{ fontSize: 12, color: '#7f8c8d', marginBottom: 8 }}>Lọc theo tỉnh/thành:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15 }}>
                        {['Tất cả', ...provincesByRegion[activeRequestRegion]].map(p => (
                            <TouchableOpacity
                                key={p}
                                onPress={() => setSelectedProvince(p === 'Tất cả' ? '' : p)}
                                style={[styles.smallTab, (selectedProvince === p || (p === 'Tất cả' && !selectedProvince)) && styles.activeSmallTab]}
                            >
                                <Text style={{ fontSize: 11, color: (selectedProvince === p || (p === 'Tất cả' && !selectedProvince)) ? '#fff' : '#666' }}>{p}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {requests.length === 0 ? (
                        <View style={styles.emptyState}><Text style={{ color: '#999' }}>Chưa có yêu cầu nào trong {regionLabels[activeRequestRegion]}.</Text></View>
                    ) : requests.map(item => (
                        <View key={item._id} style={styles.card}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text style={styles.cardName}>{item.name}</Text>
                                <TouchableOpacity onPress={() => copyToClipboard(item)}>
                                    <Text style={{ color: '#27ae60', fontSize: 12, fontWeight: 'bold' }}>📋 SAO CHÉP</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.cardPhone}>📞 {item.phone?.slice(0, 6)}xxxx</Text>
                            <Text style={styles.cardRoute}>🚗 {item.startPoint} ➔ {item.endPoint}</Text>
                            <Text style={styles.cardPrice}>💰 {item.price?.toLocaleString()} VND</Text>
                            {item.note && <Text style={styles.cardNote}>📝 {item.note}</Text>}
                        </View>
                    ))}
                </View>

                {/* Drivers Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>👨‍✈️ Danh sách tài xế</Text>
                    {renderRegionTabs(activeDriverRegion, setActiveDriverRegion)}

                    {drivers.length === 0 ? (
                        <View style={styles.emptyState}><Text style={{ color: '#999' }}>Chưa có tài xế trong {regionLabels[activeDriverRegion]}.</Text></View>
                    ) : drivers.map(driver => (
                        <View key={driver._id} style={styles.driverCard}>
                            <View style={styles.avatarSmall}><Text style={{ color: '#27ae60', fontWeight: 'bold' }}>{driver.name?.[0]}</Text></View>
                            <View style={styles.driverInfo}>
                                <Text style={styles.driverName}>{driver.name}</Text>
                                <Text style={styles.driverRoute}>{driver.route}</Text>
                            </View>
                            <TouchableOpacity style={styles.callBtn} onPress={() => handleCall(driver.phone)}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>📞 GỌI</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Auth Modal */}
            <Modal visible={!!authModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalPanel}>
                        <Text style={styles.modalTitle}>{authModal === 'login' ? '🔐 Đăng nhập' : '📝 Đăng ký tài xế'}</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {authModal === 'register' && (
                                <TextInput style={styles.input} placeholder="Họ và tên" placeholderTextColor="#999"
                                    value={authForm.name} onChangeText={t => setAuthForm({ ...authForm, name: t })} />
                            )}
                            <TextInput style={styles.input} placeholder="Số điện thoại" placeholderTextColor="#999"
                                keyboardType="phone-pad" value={authForm.phone} onChangeText={t => setAuthForm({ ...authForm, phone: t })} />
                            {authModal === 'register' && (
                                <>
                                    <TextInput style={styles.input} placeholder="Loại xe (VD: 4 chỗ, 7 chỗ)" placeholderTextColor="#999"
                                        value={authForm.carType} onChangeText={t => setAuthForm({ ...authForm, carType: t })} />
                                    <TextInput style={styles.input} placeholder="Đời xe (VD: 2020)" placeholderTextColor="#999"
                                        value={authForm.carYear} onChangeText={t => setAuthForm({ ...authForm, carYear: t })} />
                                </>
                            )}
                            <TextInput style={styles.input} placeholder="Mật khẩu" placeholderTextColor="#999"
                                secureTextEntry value={authForm.password} onChangeText={t => setAuthForm({ ...authForm, password: t })} />
                            {authModal === 'register' && (
                                <TextInput style={styles.input} placeholder="Xác nhận mật khẩu" placeholderTextColor="#999"
                                    secureTextEntry value={authForm.confirmPassword} onChangeText={t => setAuthForm({ ...authForm, confirmPassword: t })} />
                            )}

                            <TouchableOpacity style={styles.submitBtn} onPress={authModal === 'login' ? handleLogin : handleRegister} disabled={loading}>
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{loading ? "Đang xử lý..." : "XÁC NHẬN"}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => { setAuthModal(null); setAuthForm({ name: '', phone: '', password: '', confirmPassword: '', carType: '', carYear: '' }); }} style={{ marginTop: 15, marginBottom: 10 }}>
                                <Text style={{ textAlign: 'center', color: '#666' }}>Đóng</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Create Request Modal */}
            <Modal visible={showRequestModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalPanel, { maxHeight: '90%' }]}>
                        <Text style={styles.modalTitle}>🚗 Đăng ký chở cuốc xe</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TextInput style={styles.input} placeholder="Họ tên của bạn" placeholderTextColor="#999"
                                value={requestForm.name} onChangeText={t => setRequestForm({ ...requestForm, name: t })} />
                            <TextInput style={styles.input} placeholder="Số điện thoại" placeholderTextColor="#999"
                                keyboardType="phone-pad" value={requestForm.phone} onChangeText={t => setRequestForm({ ...requestForm, phone: t })} />

                            <Text style={styles.label}>Điểm đi:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                                {provincesVN63.map(p => (
                                    <TouchableOpacity key={p} onPress={() => setRequestForm({ ...requestForm, startPoint: p })}
                                        style={[styles.smallTab, requestForm.startPoint === p && styles.activeSmallTab]}>
                                        <Text style={{ fontSize: 10, color: requestForm.startPoint === p ? '#fff' : '#333' }}>{p}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.label}>Điểm đến:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                                {provincesVN63.map(p => (
                                    <TouchableOpacity key={p} onPress={() => setRequestForm({ ...requestForm, endPoint: p })}
                                        style={[styles.smallTab, requestForm.endPoint === p && styles.activeSmallTab]}>
                                        <Text style={{ fontSize: 10, color: requestForm.endPoint === p ? '#fff' : '#333' }}>{p}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <TextInput style={styles.input} placeholder="Giá dự kiến (VND)" placeholderTextColor="#999"
                                keyboardType="numeric" value={requestForm.price} onChangeText={t => setRequestForm({ ...requestForm, price: t })} />
                            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Ghi chú (Giờ giấc, loại xe...)" placeholderTextColor="#999"
                                multiline value={requestForm.note} onChangeText={t => setRequestForm({ ...requestForm, note: t })} />

                            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateRequest} disabled={loading}>
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{loading ? "Đang gửi..." : "GỬI ĐĂNG KÝ"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowRequestModal(false)} style={{ marginTop: 15, marginBottom: 10 }}>
                                <Text style={{ textAlign: 'center', color: '#666' }}>Hủy</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Payment Modal */}
            <Modal visible={showPayment} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalPanel}>
                        <Text style={styles.modalTitle}>💳 Phí vào nhóm 200.000đ</Text>
                        <Text style={{ textAlign: 'center', marginBottom: 15, color: '#666' }}>Quét mã QR bên dưới để chuyển khoản</Text>
                        <Image
                            source={{ uri: 'https://img.vietqr.io/image/VIB-081409781-compact2.png?amount=200000&addInfo=Phi%20tham%20gia%20nhom&accountName=PHAN%20NGOC%20CHUNG' }}
                            style={{ width: '100%', height: 280, borderRadius: 10, marginBottom: 15 }}
                            resizeMode="contain"
                        />
                        <TouchableOpacity style={styles.submitBtn} onPress={confirmRegister} disabled={loading}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{loading ? "Đang xử lý..." : "✅ TÔI ĐÃ CHUYỂN KHOẢN"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowPayment(false)} style={{ marginTop: 15 }}>
                            <Text style={{ textAlign: 'center', color: '#666' }}>Quay lại</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Call Sheet */}
            <Modal visible={!!callSheet} animationType="slide" transparent>
                <View style={styles.sheetOverlay}>
                    <View style={styles.sheetPanel}>
                        <Text style={{ fontSize: 16, color: '#666', marginBottom: 5 }}>Gọi điện cho tài xế</Text>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>{callSheet?.phone}</Text>
                        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#27ae60' }]} onPress={() => {
                            Linking.openURL(`tel:${callSheet?.phone}`);
                            setCallSheet(null);
                        }}>
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>📞 GỌI NGAY</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setCallSheet(null)} style={{ marginTop: 15 }}>
                            <Text style={{ textAlign: 'center', color: '#666', fontSize: 16 }}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Fake Notification Modal */}
            <Modal visible={!!fakeNotification} animationType="slide" transparent>
                <View style={styles.sheetOverlay}>
                    <View style={styles.sheetPanel}>
                        <View style={{ width: 50, height: 5, backgroundColor: '#ddd', borderRadius: 3, marginBottom: 15 }} />
                        <Text style={{ fontSize: 18, color: '#27ae60', fontWeight: 'bold', marginBottom: 5 }}>🔔 Thông báo cuốc xe mới</Text>
                        <Text style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>{fakeNotification?.displayTime}</Text>
                        
                        <View style={{ width: '100%', backgroundColor: '#f8f9fa', padding: 15, borderRadius: 12, marginBottom: 20 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>🚗 Có tài xế bắn cuốc {fakeNotification?.carType} chỗ</Text>
                            <Text style={{ fontSize: 15, color: '#333', marginBottom: 8 }}>{fakeNotification?.startPoint} ➔ {fakeNotification?.endPoint}</Text>
                            <Text style={{ fontSize: 18, color: '#e74c3c', fontWeight: 'bold' }}>💰 {fakeNotification?.price?.toLocaleString()} VND</Text>
                            {fakeNotification?.note ? (
                                <View style={{ marginTop: 10, padding: 10, backgroundColor: '#fffbea', borderLeftWidth: 3, borderLeftColor: '#f39c12', borderRadius: 6 }}>
                                    <Text style={{ fontSize: 13, color: '#7d6608' }}>📝 {fakeNotification.note}</Text>
                                </View>
                            ) : null}
                        </View>

                        <TouchableOpacity style={[styles.submitBtn, { width: '100%' }]} onPress={handleAcceptFake} disabled={acceptingFake}>
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                                {acceptingFake ? 'Đang xử lý...' : '✅ NHẬN CHUYẾN NGAY'}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={() => setFakeNotification(null)} style={{ marginTop: 15, padding: 10 }}>
                            <Text style={{ textAlign: 'center', color: '#999', fontSize: 14 }}>Bỏ qua</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Fake Error Modal */}
            <Modal visible={showFakeError} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalPanel, { alignItems: 'center', paddingVertical: 30 }]}>
                        <Text style={{ fontSize: 50, marginBottom: 10 }}>⚠️</Text>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#e74c3c', marginBottom: 15, textAlign: 'center' }}>Cuốc xe đã được nhận</Text>
                        <Text style={{ textAlign: 'center', color: '#666', fontSize: 15, marginBottom: 25, lineHeight: 22 }}>
                            {fakeErrorMessage}
                        </Text>
                        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#e74c3c', paddingHorizontal: 30 }]} onPress={() => setShowFakeError(false)}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>ĐÃ HIỂU</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Sticky Button */}
            <TouchableOpacity style={styles.stickyBtn} onPress={() => {
                if (!user) {
                    Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để đăng ký cuốc xe");
                    setAuthModal('login');
                    return;
                }
                setShowRequestModal(true);
            }}>
                <Text style={styles.stickyBtnText}>🚗 ĐĂNG KÝ CHỞ CUỐC XE  ›</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
    scrollContent: { paddingBottom: 20 },
    tickerContainer: { backgroundColor: '#2c3e50', height: 35, justifyContent: 'center', overflow: 'hidden' },
    tickerText: { color: '#f1c40f', fontSize: 13, fontWeight: 'bold' },
    userHeader: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', margin: 10, borderRadius: 12, elevation: 2 },
    avatarCircle: { width: 45, height: 45, borderRadius: 23, backgroundColor: '#27ae60', alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    avatarSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8f5e9', alignItems: 'center', justifyContent: 'center' },
    logoutBtn: { padding: 10 },
    promoBox: { backgroundColor: '#27ae60', margin: 10, padding: 25, borderRadius: 16, alignItems: 'center', elevation: 4 },
    promoTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    promoSub: { color: '#fff', fontSize: 13, opacity: 0.9, marginTop: 5 },
    promoButtons: { flexDirection: 'row', marginTop: 20, gap: 12 },
    whiteBtn: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
    greenBtn: { backgroundColor: '#1e8449', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
    btnTextGreen: { fontWeight: 'bold', color: '#27ae60', fontSize: 14 },
    btnTextWhite: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    section: { paddingHorizontal: 10, marginTop: 10 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#2c3e50' },
    tabBar: { flexDirection: 'row', gap: 8, marginBottom: 15 },
    tab: { backgroundColor: '#e0e0e0', paddingVertical: 10, borderRadius: 10, flex: 1, alignItems: 'center' },
    activeTab: { backgroundColor: '#27ae60' },
    tabText: { color: '#666', fontWeight: 'bold', fontSize: 13 },
    activeTabText: { color: '#fff' },
    smallTab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: '#eee' },
    activeSmallTab: { backgroundColor: '#27ae60' },
    emptyState: { padding: 30, alignItems: 'center', backgroundColor: '#fff', borderRadius: 12 },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, elevation: 3 },
    cardName: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
    cardPhone: { fontSize: 13, color: '#7f8c8d', marginTop: 5 },
    cardRoute: { fontSize: 15, fontWeight: 'bold', color: '#34495e', marginTop: 8 },
    cardPrice: { color: '#e74c3c', fontWeight: 'bold', marginTop: 8, fontSize: 16 },
    cardNote: { fontSize: 12, color: '#95a5a6', fontStyle: 'italic', marginTop: 8 },
    driverCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 10, marginBottom: 10, elevation: 2 },
    driverInfo: { flex: 1, marginLeft: 12 },
    driverName: { fontSize: 15, fontWeight: 'bold', color: '#2c3e50' },
    driverRoute: { color: '#7f8c8d', fontSize: 13, marginTop: 3 },
    callBtn: { backgroundColor: '#27ae60', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 25 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 15 },
    modalPanel: { backgroundColor: '#fff', borderRadius: 20, padding: 20, maxHeight: '85%' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#2c3e50' },
    label: { fontSize: 13, fontWeight: 'bold', color: '#7f8c8d', marginBottom: 8, marginTop: 5 },
    input: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e9ecef', fontSize: 15, color: '#333' },
    submitBtn: { backgroundColor: '#27ae60', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    sheetPanel: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 30, alignItems: 'center' },
    stickyBtn: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#27ae60', padding: 20, alignItems: 'center', borderTopLeftRadius: 25, borderTopRightRadius: 25, elevation: 10 },
    stickyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 17 }
});
