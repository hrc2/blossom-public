import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createAppContainer, createStackNavigator, createBottomTabNavigator, TabBarBottom } from 'react-navigation';
import { RecorderScreen } from './screens/recorder_screen';
import { SequencesScreen } from './screens/sequences_screen';
import { GenerationScreen } from './screens/generation_screen';
import { SettingsScreen } from './screens/settings_screen';
import { NavButton } from "./components/nav_button";
import { Text, Icon, Button } from "native-base";


const TabNavigator = createBottomTabNavigator(
    {
        Recorder: { screen: RecorderScreen },
        Sequences: { screen: SequencesScreen  },
        Generator: { screen: GenerationScreen  },
    },
    {
        navigationOptions: ({ navigation }) => ({
          tabBarIcon: ({ focused, tintColor }) => {
            const { routeName } = navigation.state;
            let iconName;
            if (routeName === 'Recorder') {
              iconName = "md-videocam";
            } else if (routeName === 'Sequences') {
              iconName = "md-play";
            } else if (routeName === 'Generator') {
              iconName = "md-code";
            }
            return <Ionicons name={iconName} size={25} color={tintColor} />;
          },
        }),
        tabBarComponent: TabBarBottom,
        tabBarPosition: 'bottom',
        tabBarOptions: {
          activeTintColor: 'dodgerblue',
          inactiveTintColor: 'gray',
        },
        animationEnabled: true,
        swipeEnabled: false,
    }
);
  
const StackNavigator = createStackNavigator(
    {
        Home: {
            screen: TabNavigator,
            
            navigationOptions: ({navigation}) => ({
                title: "Blossom App",
                headerRight: <NavButton navigation={navigation} />,
            }),
        },
        
        Settings: {
            screen: SettingsScreen,

            navigationOptions: ({navigation}) => ({
                title: "Settings",
            }),
        }
    }
);

const AppContainer = createAppContainer(StackNavigator);

export default AppContainer;
