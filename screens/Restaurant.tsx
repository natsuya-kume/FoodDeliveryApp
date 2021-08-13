import React from 'react';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
  ImageSourcePropType,
} from 'react-native';

import {isIphoneX} from 'react-native-iphone-x-helper';

import {icons, SIZES, FONTS, COLORS} from '../constants';
import {RootStackParamList} from '../types';

type RestaurantScreenRouteProp = RouteProp<RootStackParamList, 'Restaurant'>;
type RestaurantScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Restaurant'
>;

type RestaurantProps = {
  route: RestaurantScreenRouteProp;
  navigation: RestaurantScreenNavigationProp;
};

type itemProps = {
  menuId: number;
  qty: number;
  price: number;
  total: number;
}[];
type itemFilteredProps = {
  menuId: number;
  qty: number;
  price: number;
  total: number;
};

type menuItem = {
  menuId: number;
  name: string;
  photo: ImageSourcePropType;
  description: string;
  calories: number;
  price: number;
};

const Restaulant = ({route, navigation}: RestaurantProps) => {
  const scrollX = new Animated.Value(0);

  // レストラン情報の管理
  const [restaurant, setRestaurant] = React.useState(null);
  // 現在地の管理
  const [currentLocation, setCurrentLocation] = React.useState(null);

  // オーダー全体の管理（配列）
  const [orderItems, setOrderItems] = React.useState<itemProps>([]);

  // 初回レンダリングでparamsからレストラン情報と現在地の情報を受け取る
  React.useEffect(() => {
    let {item, currentLocation} = route.params;

    // レストラン情報を更新
    setRestaurant(item);
    // 現在地の情報を更新
    setCurrentLocation(currentLocation);
  });

  // オーダー編集時の関数
  const editOrder = (action: string, menuId: number, price: number): void => {
    // orderItems配列のコピー作成
    let orderList: itemProps = orderItems.slice();
    // orderList(orderItemsのコピー)配列で、menuIdとa.menuIdが同じ配列を作る
    let item: itemProps = orderList.filter(
      (a: itemFilteredProps): boolean => a.menuId === menuId,
    );
    // +が押された場合
    if (action === '+') {
      // itemの数が0より大きければ
      if (item.length > 0) {
        // item配列の中のqtyとtotalを更新
        let newQty = item[0].qty + 1;
        item[0].qty = newQty;
        item[0].total = item[0].qty * price;
      } else {
        // 初期化する
        const newItem = {
          menuId: menuId,
          qty: 1,
          price: price,
          total: price,
        };
        orderList.push(newItem);
      }
      setOrderItems(orderList);
    } else {
      // itemの数が0より大きければ
      if (item.length > 0) {
        // qtyが0より大きければ
        if (item[0]?.qty > 0) {
          // item配列の中のqtyとtotalを更新
          let newQty = item[0].qty - 1;
          item[0].qty = newQty;
          item[0].total = newQty * price;
        }
      }
      setOrderItems(orderList);
    }
  };

  // オーダーの数を取得する関数
  const getOrderQty = (menuId: number) => {
    // orderItems配列の中でmenuIdと一致するものを探す
    let orderItem = orderItems.filter(a => a.menuId === menuId);
    // 0より大きい場合は返す
    if (orderItem.length > 0) {
      return orderItem[0].qty;
    }
  };

  // 注文した商品の合計を数える関数
  const getBasketItemCount = () => {
    let itemCount: number = orderItems.reduce((a, b) => a + (b.qty || 0), 0);
    return itemCount;
  };

  // 注文した商品の合計金額を数える関数
  const sumOrder = () => {
    let total: number = orderItems.reduce((a, b) => a + (b.total || 0), 0);
    return total.toFixed(2);
  };

  // ヘッダー描画関数
  const renderHeader = () => {
    return (
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          style={{
            width: 50,
            paddingLeft: SIZES.padding * 2,
            justifyContent: 'center',
          }}
          onPress={() => navigation.goBack()}>
          <Image
            source={icons.back}
            resizeMode="contain"
            style={{width: 30, height: 30}}
          />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <View
            style={{
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: SIZES.padding * 3,
              borderRadius: SIZES.radius,
              backgroundColor: COLORS.lightGray3,
            }}>
            <Text style={{...FONTS.h3}}>{restaurant?.name}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={{
            width: 50,
            paddingRight: SIZES.padding * 2,
            justifyContent: 'center',
          }}>
          <Image
            source={icons.list}
            resizeMode="contain"
            style={{width: 30, height: 30}}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // 食べ物情報描画関数
  const renderFoodInfo = () => {
    return (
      <Animated.ScrollView
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: false},
        )}>
        {restaurant?.menu.map((item: menuItem, index: number) => (
          <View key={`menu-${index}`} style={{alignItems: 'center'}}>
            <View style={{height: SIZES.height * 0.35}}>
              <Image
                source={item.photo}
                resizeMode="cover"
                style={{width: SIZES.width, height: '100%'}}
              />

              <View
                style={{
                  position: 'absolute',
                  bottom: -20,
                  width: SIZES.width,
                  height: 50,
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}>
                <TouchableOpacity
                  style={{
                    width: 50,
                    backgroundColor: COLORS.white,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderTopLeftRadius: 25,
                    borderBottomLeftRadius: 25,
                  }}
                  onPress={() => editOrder('-', item.menuId, item.price)}>
                  <Text style={{...FONTS.body1}}>-</Text>
                </TouchableOpacity>
                <View
                  style={{
                    width: 50,
                    backgroundColor: COLORS.white,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={{...FONTS.h2}}>{getOrderQty(item.menuId)}</Text>
                </View>
                <TouchableOpacity
                  style={{
                    width: 50,
                    backgroundColor: COLORS.white,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottomRightRadius: 25,
                    borderTopRightRadius: 25,
                  }}
                  onPress={() => editOrder('+', item.menuId, item.price)}>
                  <Text style={{...FONTS.body1}}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                width: SIZES.width,
                alignItems: 'center',
                marginTop: 15,
                paddingHorizontal: SIZES.padding * 2,
              }}>
              <Text
                style={{
                  marginVertical: 10,
                  textAlign: 'center',
                  ...FONTS.h2,
                }}>
                {item.name} - {item.price.toFixed(2)}
              </Text>
              <Text style={{...FONTS.body3}}>{item.description}</Text>
            </View>

            <View style={{flexDirection: 'row', marginTop: 10}}>
              <Image
                source={icons.fire}
                style={{width: 20, height: 20, marginRight: 10}}
              />
              <Text style={{...FONTS.body3, color: COLORS.darkgray}}>
                {item.calories.toFixed(2)} cal
              </Text>
            </View>
          </View>
        ))}
      </Animated.ScrollView>
    );
  };

  // ドット描画関数
  const renderDots = () => {
    const dotPosition = Animated.divide(scrollX, SIZES.width);
    return (
      <View style={{height: 30}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: SIZES.padding,
          }}>
          {restaurant?.menu.map((item: menuItem, index: number) => {
            const opacity = dotPosition.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            const dotSize = dotPosition.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [SIZES.base * 0.8, 10, SIZES.base * 0.8],
              extrapolate: 'clamp',
            });
            const dotColor = dotPosition.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [COLORS.darkgray, COLORS.primary, COLORS.darkgray],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={`dot-${index}`}
                opacity={opacity}
                style={{
                  borderRadius: SIZES.radius,
                  marginHorizontal: 6,
                  width: dotSize,
                  height: dotSize,
                  backgroundColor: dotColor,
                }}
              />
            );
          })}
        </View>
      </View>
    );
  };

  // 注文情報描画関数
  const renderOrder = () => {
    return (
      <View>
        {renderDots()}
        <View
          style={{
            backgroundColor: COLORS.white,
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: SIZES.padding * 2,
              paddingHorizontal: SIZES.padding * 3,
              borderBottomColor: COLORS.lightGray2,
              borderBottomWidth: 1,
            }}>
            <Text style={{...FONTS.h3}}>
              {getBasketItemCount()} items in Cart
            </Text>
            <Text style={{...FONTS.h3}}>${sumOrder()}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingVertical: SIZES.padding * 2,
              paddingHorizontal: SIZES.padding * 3,
            }}>
            <View style={{flexDirection: 'row'}}>
              <Image
                source={icons.pin}
                resizeMode="contain"
                style={{width: 20, height: 20, tintColor: COLORS.darkgray}}
              />
              <Text style={{marginLeft: SIZES.padding, ...FONTS.h4}}>
                Location
              </Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Image
                source={icons.master_card}
                style={{width: 20, height: 20, tintColor: COLORS.darkgray}}
              />
              <Text style={{marginLeft: SIZES.padding, ...FONTS.h4}}>8888</Text>
            </View>
          </View>
          <View
            style={{
              padding: SIZES.padding * 2,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              style={{
                width: SIZES.width * 0.9,
                padding: SIZES.padding,
                backgroundColor: COLORS.primary,
                alignItems: 'center',
                borderRadius: SIZES.radius,
              }}
              onPress={() =>
                navigation.navigate('OrderDelivery', {
                  restaurant: restaurant,
                  currentLocation: currentLocation,
                })
              }>
              <Text style={{color: COLORS.white, ...FONTS.h2}}>Order</Text>
            </TouchableOpacity>
          </View>
        </View>
        {isIphoneX() && (
          <View
            style={{
              position: 'absolute',
              bottom: -34,
              left: 0,
              right: 0,
              height: 34,
              backgroundColor: COLORS.white,
            }}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderFoodInfo()}
      {renderOrder()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray2,
  },
});

export default Restaulant;
