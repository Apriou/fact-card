import React from "react";
import { StyleSheet, Text, View, Animated, PanResponder } from "react-native";
import FactCard from "./components/fact-card";
//Pour avoir un style responsive (% au lieu de px)
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import axios from "axios";

const CARD_X_ORIGIN = wp("5%");
const MAX_LEFT_ROTATION_DISTANCE = wp("-150%");
const MAX_RIGHT_ROTATION_DISTANCE = wp("150%");
const LEFT_TRESHOLD_BEFORE_SWIPE = wp("-50%");
const RIGHT_TRESHOLD_BEFORE_SWIPE = wp("50%");

const FACT_URL = "http://randomuselessfact.appspot.com/random.json?language=en";
const RANDOM_IMAGE_URL = "https://picsum.photos/300/200?image=";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      panResponder: undefined,
      topFact: undefined,
      bottomFact: undefined,
    };
    this.position = new Animated.ValueXY();
    //this.position = new Animated.ValueXY(0, 0);
    // this.position = new Animated.ValueXY(0, 0);
    // Animated.timing(this.position, {
    //   toValue: { x: 200, y: 300 },
    // }).start();
    // Animated.spring(this.position, {
    //   toValue: { x: 200, y: 300 },
    // }).start();
  }

  componentDidMount() {
    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (e, gesture) => {
        //on désactive le panResponder si on scroll trois fois plus en y
        return Math.abs(gesture.dx) > Math.abs(gesture.dy * 3);
      }, //true permet d'activer onPanResponderMove
      onPanResponderMove: (event, gesture) => {
        //Permet de capturer le mouvement du doigt sur l'ecran
        //console.log("gesture", gesture);
        this.position.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (event, gesture) => {
        //Permet capter le relachement du doigt
        if (gesture.dx < LEFT_TRESHOLD_BEFORE_SWIPE) {
          this.forceLeftExit();
        } else if (gesture.dx > RIGHT_TRESHOLD_BEFORE_SWIPE) {
          this.forceRightExit();
        } else {
          this.resetPositionSoft();
        }
      },
    });

    this.setState({ panResponder }, () => {
      //On va chercher un fact et une image aleatoire pour le topFard
      axios.get(FACT_URL).then((response) => {
        this.setState({
          topFact: {
            ...response.data,
            image: this.getRandomImageURL(),
          },
        });
      });
      this.loadBottomFact();
    });
  }

  loadBottomFact() {
    //On va chercher un fact et une image aleatoire pour le bottomFard
    axios.get(FACT_URL).then((response) => {
      this.setState({
        bottomFact: {
          ...response.data,
          image: this.getRandomImageURL(),
        },
      });
    });
  }

  getRandomImageURL() {
    //un range de 500 image aleatoire par exemple
    return `${RANDOM_IMAGE_URL}${Math.floor(Math.random() * 500 + 1)}`;
  }

  onCardExitDone = () => {
    //On flêche la fonction car on veut garder le this
    //la carte de derrière passe devant
    this.setState({
      topFact: this.state.bottomFact,
    });
    //on charge la carte de derrière
    this.loadBottomFact();
    //On replace la carte sortie en plein centre (instantané)
    this.position.setValue({
      x: 0,
      y: 0,
    });
  };

  forceLeftExit() {
    Animated.timing(this.position, {
      toValue: { x: wp("-100%"), y: 0 },
    }).start(this.onCardExitDone);
  }

  forceRightExit() {
    Animated.timing(this.position, {
      toValue: { x: wp("100%"), y: 0 },
    }).start(this.onCardExitDone);
  }

  resetPositionSoft() {
    Animated.spring(this.position, {
      toValue: { x: 0, y: 0 },
    }).start();
  }

  getCardStyle() {
    //Effet de rotation (swipe)
    const rotation = this.position.x.interpolate({
      inputRange: [MAX_LEFT_ROTATION_DISTANCE, 0, MAX_RIGHT_ROTATION_DISTANCE],
      outputRange: ["-120deg", "0deg", "120deg"],
    });
    return {
      transform: [{ rotate: rotation }],
      ...this.position.getLayout(),
    };
  }

  renderTopCard() {
    return (
      <Animated.View
        {...this.state.panResponder.panHandlers}
        style={this.getCardStyle()}
      >
        <FactCard disabled={false} fact={this.state.topFact} />
      </Animated.View>
    );
  }

  renderBottomCard() {
    return (
      //Obligé de mettre en absolute pour quelle se cache vraiment derrière
      <View style={{ zIndex: -1, position: "absolute" }}>
        <FactCard disabled={true} fact={this.state.bottomFact} />
      </View>
    );
  }

  render() {
    // console.log(
    //   "topFact",
    //   this.state.topFact,
    //   "BottomFact",
    //   this.state.bottomFact
    // );

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Fact Swipe</Text>
        <View>
          {this.state.topFact && this.renderTopCard()}
          {this.state.bottomFact && this.renderBottomCard()}
        </View>
      </View>
    );
  }

  //Exemple 1
  //render() {
  //return (
  //<Animated.View style={this.position.getLayout()}>
  //<View style={styles.square}>
  //</View>
  //</Animated.View>
  //);
  //}
}

const styles = StyleSheet.create({
  square: {
    width: 100,
    height: 100,
    backgroundColor: "red",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    marginTop: 50,
  },
  title: {
    fontSize: 30,
    marginBottom: 50,
  },
});
