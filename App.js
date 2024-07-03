import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Image, Dimensions, Animated, PanResponder, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';

const SCREEN_WIDTH = Dimensions.get('window').width;

const CARD_COLORS = {
  'VISA': '#4361EE',
  'Mastercard': '#FF9E00',
};

const Card = ({ data, style }) => {
  const { bankName, cardNumber, cardHolder, expiryDate, network, backgroundImage } = data;
  const cardColor = CARD_COLORS[network] || 'gray';

  const getImageSource = (image) => {
    if (typeof image === 'string') {
      return { uri: image };
    }
    return image;
  };

  return (
    <Animated.View style={[styles.card, style]}>
      <View style={styles.imageContainer}>
        <Image
          source={getImageSource(backgroundImage)}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.cardTop}>
        <Text style={styles.bankName}>{bankName}</Text>
        <View style={styles.cardChip}>
          <Image source={require('./assets/images/chip.png')} style={styles.chipIcon} />
          <Image source={require('./assets/images/wifi_logo.png')} style={styles.networkLogo} />
        </View>
      </View>
      <View style={styles.cardNumberContainer}>
        <Text style={styles.cardNumber}>{cardNumber}</Text>
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.cardHolderLabel}>
          <Text style={styles.labelOne}>Card Holder name</Text>
          <Text style={styles.labelTwo}>Expiry date</Text>
          <Image source={require('./assets/images/visa.png')} style={styles.networkLogoVisa} />
        </View>
        <View style={styles.nameLabel}>
          <Text style={styles.cardHolder}>{cardHolder}</Text>
          <Text style={styles.expiryDate}>{expiryDate}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const App = () => {
  const [fontsLoaded] = useFonts({
    'SpaceGrotesk': require('./assets/fonts/SpaceGrotesk-Regular.ttf'),
    'SpaceGrotesk-Bold': require('./assets/fonts/SpaceGrotesk-Bold.ttf'),
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState([
    {
      bankName: 'Bank of Designers',
      cardNumber: '3234 8678 4234 7628',
      cardHolder: 'Maya Singh',
      expiryDate: '08/24',
      network: 'VISA',
      backgroundImage: require('./assets/images/card1.png'),
    },
    {
      bankName: 'Bank of Designers',
      cardNumber: '3234 8678 4234 7628',
      cardHolder: 'Maya Singh',
      expiryDate: '08/24',
      network: 'VISA',
      backgroundImage: require('./assets/images/card2.png'),
    },
    {
      bankName: 'Bank of Designers',
      cardNumber: '3234 8678 4234 7628',
      cardHolder: 'Maya Singh',
      expiryDate: '08/24',
      network: 'VISA',
      backgroundImage: require('./assets/images/card3.png'),
    },
    {
      bankName: 'Bank of Designers',
      cardNumber: '3234 8678 4234 7628',
      cardHolder: 'Maya Singh',
      expiryDate: '08/24',
      network: 'VISA',
      backgroundImage: require('./assets/images/card4.png'),
    },
  ]);
  
  const cardsPan = useRef(new Animated.ValueXY()).current;
  const cardsStackedAnim = useRef(new Animated.Value(0)).current;

  const cardsPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      cardsPan.setValue({ x: gestureState.dx, y: 0 });
    },
    onPanResponderRelease: (event, gestureState) => {
      const SWIPE_THRESHOLD = 320;
      if (Math.abs(gestureState.dx) > SWIPE_THRESHOLD) {
        Animated.timing(cardsPan, {
          toValue: { x: gestureState.dx > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH, y: 0 },
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          cardsPan.setValue({ x: 0, y: 0 });
          setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
          cardsStackedAnim.setValue(0);
        });
      } else {
        Animated.timing(cardsPan, {
          toValue: { x: 0, y: 0 },
          duration: 300,
          useNativeDriver: true,
        }).start();

        Animated.timing(cardsStackedAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          cardsStackedAnim.setValue(0);
          setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
        });
      }
    },
  });

  const renderCards = () => {
    return cards.map((card, index) => {
      const cardIndex = (currentIndex + index) % cards.length;
      const isFrontCard = index === 0;

      const animatedStyle = {
        zIndex: isFrontCard
          ? cardsStackedAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [3, 2, 0],
            })
          : index,
        transform: [
          {
            translateY: isFrontCard
              ? cardsStackedAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -30 * index],
                })
              : -30 * index,
          },
          { translateX: isFrontCard ? cardsPan.x : 0 },
          {
            scale: 1,
          },
        ],
        opacity: isFrontCard
          ? cardsPan.x.interpolate({
              inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
              outputRange: [0.5, 1, 0.5],
            })
          : 1 - 0.1 * index,
      };

      return (
        <Animated.View
          key={cardIndex}
          {...(isFrontCard ? cardsPanResponder.panHandlers : {})}
          style={[styles.card, animatedStyle]}
        >
          <Card data={cards[cardIndex]} />
        </Animated.View>
      );
    }).reverse();
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topDiv}>
          <View style={styles.container}>
            <View style={styles.circleLogo}>
              <Image style={styles.circleLogoImg} source={require('./assets/images/logo.png')} />
            </View>
            <View style={styles.tipsBox}>
              <Text style={styles.tipsText}>
                <Image style={styles.vector} source={require('./assets/images/Vector.png')} /> Tips
              </Text>
            </View>
          </View>
          <Text style={styles.textBoldCC}>All your credit cards</Text>
          <Text style={styles.textCC}>Find all your credit cards here</Text>
        </View>
        <View style={styles.bottomDiv}>
          <Image style={styles.icon} source={require('./assets/images/fingerprint_black_24dp.png')} />
          <Image style={styles.icon} source={require('./assets/images/flight_takeoff_black_24dp.png')} />
          <Image style={styles.icon} source={require('./assets/images/water_drop_black_24dp.png')} />
          <Image style={styles.icon} source={require('./assets/images/health_and_safety_black_24dp.png')} />
          <Image style={styles.icon} source={require('./assets/images/history_edu_black_24dp.png')} />
          <Image style={styles.icon} source={require('./assets/images/card_membership_black_24dp.png')} />
        </View>
        <View style={styles.cardContainer}>
          {renderCards()}
        </View>
        <View style={styles.addLogoContainer}>
          <Image style={styles.addLogoImg} source={require('./assets/images/addLogo.png')} />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'grey',
  },
  topDiv: {
    width: '100%',
    height: 200,
    backgroundColor: 'black',
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: '35%',
  },
  circleLogo: {
    width: 55,
    height: 55,
    borderRadius: 50,
    marginTop: 15,
    margin: 10,
  },
  circleLogoImg: {
    width: 55,
    height: 55,
  },
  tipsBox: {
    backgroundColor: 'grey',
    width: 60,
    height: 30,
    marginTop: 25,
    margin: 10,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  tipsText: {
    fontSize: 18,
    color: '#F5F6F7',
    margin: 4,
  },
  vector: {
    width: 10,
    height: 15,
    margin: 2,
    marginTop: -4,
  },
  textBoldCC: {
    fontFamily: 'Helvetica 65 Medium',
    fontSize: 34,
    marginTop: 25,
    margin: 9,
    fontWeight: '800',
    color: '#F5F6F7',
  },
  textCC: {
    fontSize: 20,
    marginTop: 10,
    margin: 10,
    color: '#F5F6F7',
  },
  bottomDiv: {
    backgroundColor: 'grey',
    width: '100%',
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 19,
  },
  icon: {
    width: 33,
    height: 30,
    marginTop: 15,
    margin: 15,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'grey',
    marginTop: 69,
  },
  card: {
    width: SCREEN_WIDTH - 40,
    height: 200,
    borderRadius: 10,
    position: 'absolute',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  cardTop: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardDetails: {
    padding: 10,
  },
  bankName: {
    height: 20,
    fontSize: 16,
    color: 'white',
    fontFamily: 'SpaceGrotesk',
    marginLeft:1,
  },
  cardChip: {
    flex: 1,
    marginRight: 0,
    marginLeft: -137,
    marginTop: 25,
    flexDirection: "row",
    justifyContent: '',
  },
  chipIcon: {
    width: 40,
    height: 40,
  },
  cardNumberContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  cardNumber: {
    marginTop: -25,
    marginRight: 115,
    fontSize: 18,
    color: 'white',
    // backgroundColor:'red',
    // letterSpacing: 2,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  cardHolderLabel: {
    flexDirection: 'row',
  },
  labelTwo: {
    fontSize: 13,
    color: 'white',
    flexDirection: 'row',
    marginLeft: 50,
  },
  labelOne: {
    fontSize: 13,
    color: 'white',
    flexDirection: 'row',
  },
  nameLabel: {
    flexDirection: 'row',
  },
  cardHolder: {
    fontSize: 16,
    color: 'white',
    marginTop: -17,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  expiryDate: {
    fontSize: 16,
    color: 'white',
    marginTop: -17,
    marginLeft: 65,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  networkLogoVisa: {
    width: 50,
    height: 30,
    marginTop: 10,
    marginLeft: 23,
  },
  networkLogo: {
    width: 25,
    height: 39,
    position: 'absolute',
    bottom: 3,
    right: 10,
  },
  addLogoImg: {
    width: 100,
    height: 100,
    marginLeft: 280,
    marginBottom: 20,
  },
  addLogoContainer: {
    backgroundColor: 'grey',
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 0,
    overflow: 'hidden',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
