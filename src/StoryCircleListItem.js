import React, {useState, useEffect} from "react";
import {View, Image, TouchableOpacity, Text, StyleSheet, Platform} from "react-native";
import {usePrevious} from "./helpers/StateHelpers";

import DEFAULT_AVATAR from "./assets/images/no_avatar.png";

const StoryCircleListItem = (props) => {

    const {
        item,
        unPressedBorderColor,
        pressedBorderColor,
        avatarSize,
        showText,
        textStyle
    } = props;

    const [isPressed, setIsPressed] = useState(props?.item?.seen);

    const prevSeen = usePrevious(props?.item?.seen);

    useEffect(() => {
        if (prevSeen != props?.item?.seen) {
            setIsPressed(props?.item?.seen);
        }

    }, [props?.item?.seen]);

    const _handleItemPress = item => {
        const {handleStoryItemPress} = props;

        if (handleStoryItemPress) handleStoryItemPress(item);

        setIsPressed(true);
    };

    const size = avatarSize ?? 70;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => _handleItemPress(item)}
                style={[
                    styles.avatarWrapper,
                   
                    !isPressed
                        ? {
                            borderColor: unPressedBorderColor
                                ? unPressedBorderColor
                                : 'red'
                        }
                        : {
                            borderColor: pressedBorderColor
                                ? pressedBorderColor
                                : 'grey'
                        }
                ]}
            >
                <Image
                    style={{
                        height: size,
                        width: size,
                        borderRadius: 100,
                    }}
                    source={{uri: item.user_image}}
                    defaultSource={Platform.OS === 'ios' ? DEFAULT_AVATAR : null}
                />
            </TouchableOpacity>
            {showText &&
                <Text
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                    style={{
                        width: size + 4,
                        ...styles.text,
                        ...textStyle
                    }}>{item.user_name}</Text>}
        </View>
    );
}

export default StoryCircleListItem;

const styles = StyleSheet.create({
    container: {
        marginVertical: 5,
        marginRight: 8,
        marginLeft: 8
    },
    avatarWrapper: {
        borderWidth: 3,
        padding: 2,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        borderColor: 'red',
        borderRadius: 100,
        height: 80,
        width: 80
    },
    text: {
        marginTop: 3,
        textAlign: "center",
        alignItems: "center",
        fontSize: 11
    }
});
