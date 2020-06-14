import React, { Component } from "react";
import { View, Image, Button, Text, Linking, ScrollView } from "react-native";
//Pour avoir un style responsive (% au lieu de px)
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

class FactCard extends Component {
  goToTopScrollView = () => {
    this.myScrollView.scrollTo({ x: 0, y: 0, animated: true });
  };

  render() {
    return (
      <View
        style={{
          elevation: 1, //marche que pour android
          shadowColor: "black", //pour ios
          shadowOffset: { width: 1, height: 1 }, //pour ios
          shadowOpacity: 0.7,
          width: wp("90%"),
          backgroundColor: "white",
        }}
      >
        <Image
          style={{
            width: wp("90%"),
            height: hp("30%"),
          }}
          source={{
            uri: this.props.fact.image,
          }}
        />
        <ScrollView
          ref={(scrollViewRef) => {
            this.myScrollView = scrollViewRef;
          }}
          onScrollEndDrag={this.goToTopScrollView}
          height={hp("10%")}
        >
          <Text>{this.props.fact.text}</Text>
        </ScrollView>
        <Button
          title="See the source"
          disabled={this.props.disabled}
          onPress={() => {
            console.log(this.props.fact.source_url);
            Linking.openURL(this.props.fact.source_url);
          }}
        />
      </View>
    );
  }
}

export default FactCard;
