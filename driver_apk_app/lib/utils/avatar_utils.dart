import '../utils/provinces.dart';

/// Avatar utilities for driver cards
class AvatarUtils {
  // List of all avatar filenames (52 avatars)
  static const List<String> _avatarFiles = [
    'z7051375359431_55334752bc044f51f50bb7d28b6ae5c9.jpg',
    'z7051375367540_06e3fe3d8120166b5e07a244e7a3571e.jpg',
    'z7051375377233_8b09960f41a31b33ab9d064230632c7a.jpg',
    'z7051375393488_5e5f019e86dc98d4334a1c765ce911d4.jpg',
    'z7051375394685_8428fe1e5c811cabe9f3475f18440329.jpg',
    'z7051375399930_43df68359501e5c5a4e4fd8f089dd297.jpg',
    'z7051375407886_39999056318f4140274ec094449664e9.jpg',
    'z7051375420352_c4ec77afe2e2c47657123399c9ca4f46.jpg',
    'z7051375433234_de014f2a3854199145f85ef65859e932.jpg',
    'z7051384987349_1a055f75e29524fed934bb81d7249f0b.jpg',
    'z7051384998410_7e88aec16eb95d1e181161e722ce8f1b.jpg',
    'z7051384999798_82ecbb32edc031d9bbd1359aed835cb0.jpg',
    'z7051385010505_1cd3cd3701a4456ee78a6bb67e4e6464.jpg',
    'z7062602257556_b8719a5849303a700b3257a8e3012bb4.jpg',
    'z7062602275749_8b5789e4ab9f950dd7e4a5fee4754b3f.jpg',
    'z7062602297392_cef5adc08fda52731af78e9dd8fe1879.jpg',
    'z7062602298879_e73752e0579b874426e5d1744d393b78.jpg',
    'z7062602308491_47290c9368d7ce4b35389881388df126.jpg',
    'z7062602317722_5bae833c25d8ab15ff6bb2386b6a9209.jpg',
    'z7062602329985_52d33e21f661417ac0bd144077a9804d.jpg',
    'z7062602335506_3fac8799f639d5dc1d8bfe14899306d0.jpg',
    'z7062602341125_1874741c14c173f454bc55d653a1949a.jpg',
    'z7062602345593_64e2222b1ec3eac6e5b1850a81c07e52.jpg',
    'z7062602354757_5172680358be8de07be55f66171f19b3.jpg',
    'z7062602357606_ad5f2b2efa209539197f5328b5f40cc9.jpg',
    'z7062602365148_b7129daf0ec1871281533e44be5aa0a3.jpg',
    'z7062602368656_a9f0d3060715338b81bfa799b5c2c1d6.jpg',
    'z7062602377742_00c7adb0a0ad63312a284abff17a88e8.jpg',
    'z7062602381334_08b299f5b038054742be8d558a74f45e.jpg',
    'z7062602390663_be30aed63f66d5ebabc16818b210d4a1.jpg',
    'z7062668517282_54f02c8079d34160fba36135f63d76e7.jpg',
    'z7062668540624_9480d4b585309d9749dac24605bf6197.jpg',
    'z7062668561135_95234d08acd6d50f85974c6ea79a73b5.jpg',
    'z7062668563791_ec9f4c7979fba82b46b6e9dd5f49532b.jpg',
    'z7062668564925_c326855dc83272d5116876979ab27180.jpg',
    'z7062668577090_42dca689332b943cff6fcf0282affbde.jpg',
    'z7062668584897_e5c2ed5020cd2b90921cdd893caba47a.jpg',
    'z7062668607225_6c7568be9de0842233a31ebf94fcd7c3.jpg',
    'z7062668621083_cee3c2b417b1390405f1843bc6747a2f.jpg',
    'z7062668637378_8fcb65da4267fabbafe41944b59320bc.jpg',
    'z7062668640898_e96516b4e85410be1b7659988df35d34.jpg',
    'z7062668642812_392e44a32f32e80bbbf27eabf1cd6c4e.jpg',
    'z7062668646863_12dc0e765ab72a82d534671819c05c0b.jpg',
    'z7062668649275_faa69d98dd07c9b1a763fd9053be0ee3.jpg',
    'z7062668649550_d523c6e3fea527ad376bd5c7379b6e71.jpg',
    'z7062668656409_8e28337ee69d5d76530cbadb795340ee.jpg',
    'z7062668663673_2fb68dc15854ad1a1dab297bc8e3def3.jpg',
    'z7062668675472_811ae7e6ea377fdb6f4cfa47e9073665.jpg',
    'z7062668683655_c31ff8791f1f519f920b4626b1bfb078.jpg',
    'z7062668699662_c4f6c0289de72ec8dfb91ae6dc179d01.jpg',
    'z7062668711051_d3683c386842cb7af2b9b53c9a060faf.jpg',
    'z7062668724268_6324cea23465d2222acc396f0a0700ef.jpg',
  ];

  // Cache để track avatars đã sử dụng
  static final Map<String, Set<int>> _usedAvatars = {
    'north': <int>{},
    'central': <int>{},
    'south': <int>{},
  };

  /// Enhanced hash function with multiple factors
  static int _hashString(String input) {
    int hash = 0;
    for (int i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash + input.codeUnitAt(i)) & 0xffffffff;
    }
    return hash.abs();
  }

  /// Get unique avatar index using driver ID as primary key
  static int _pickUniqueAvatarIndex(String driverId, String name, String phone, Region region) {
    // Create region-specific pools
    final List<int> regionPool = [];
    
    for (int i = 0; i < _avatarFiles.length; i++) {
      switch (region) {
        case Region.north:
          if (i % 3 == 0) regionPool.add(i);
          break;
        case Region.central:
          if (i % 3 == 1) regionPool.add(i);
          break;
        case Region.south:
          if (i % 3 == 2) regionPool.add(i);
          break;
      }
    }
    
    final regionKey = region.name;
    final usedSet = _usedAvatars[regionKey]!;
    
    // Primary hash using driver ID (most unique)
    int primaryHash = _hashString(driverId);
    int selectedIndex = regionPool[primaryHash % regionPool.length];
    
    // If not used, use it
    if (!usedSet.contains(selectedIndex)) {
      usedSet.add(selectedIndex);
      return selectedIndex;
    }
    
    // Secondary hash using name + phone
    int secondaryHash = _hashString('$name-$phone');
    selectedIndex = regionPool[secondaryHash % regionPool.length];
    
    if (!usedSet.contains(selectedIndex)) {
      usedSet.add(selectedIndex);
      return selectedIndex;
    }
    
    // Tertiary: Find first unused avatar in region pool
    for (int index in regionPool) {
      if (!usedSet.contains(index)) {
        usedSet.add(index);
        return index;
      }
    }
    
    // Fallback: Use hash even if duplicate (rare case)
    return regionPool[primaryHash % regionPool.length];
  }

  /// Get avatar asset path for a driver using unique ID
  static String getAvatarPath(String driverId, String name, String phone, Region region) {
    final index = _pickUniqueAvatarIndex(driverId, name, phone, region);
    return 'assets/avatars/${_avatarFiles[index]}';
  }

  /// Get avatar initials as fallback
  static String getInitials(String name) {
    if (name.isEmpty) return 'TX';
    
    final words = name.trim().split(' ');
    if (words.length == 1) {
      return words[0].substring(0, 1).toUpperCase();
    } else {
      return '${words.first.substring(0, 1)}${words.last.substring(0, 1)}'.toUpperCase();
    }
  }

  /// Reset avatar cache (for testing)
  static void resetCache() {
    _usedAvatars['north']!.clear();
    _usedAvatars['central']!.clear();
    _usedAvatars['south']!.clear();
  }
}