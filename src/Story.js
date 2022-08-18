import React, {Fragment, useRef, useState, useEffect} from "react";
import {Dimensions, View, Platform} from "react-native";
import Modal from "react-native-modalbox";
import StoryListItem from "./StoryListItem";
import StoryCircleListView from "./StoryCircleListView";
import {isNullOrWhitespace} from "./helpers/ValidationHelpers";
import type {IUserStory} from "./interfaces/IUserStory";
import AndroidCubeEffect from "./components/AndroidCubeEffect";
import CubeNavigationHorizontal from "./components/CubeNavigationHorizontal";
import {TextStyle} from "react-native";

type Props = {
    data: IUserStory[],
    style?: any,
    unPressedBorderColor?: string,
    pressedBorderColor?: string,
    onClose?: function,
    onStart?: function,
    onChange?: function,
    onStoryNext?: function,
    onStoryPrevious?: function,
    duration?: number,
    swipeText?: string,
    customSwipeUpComponent?: () => ReactDOMElement,
    customCloseComponent?: any,
    avatarSize?: number,
    showAvatarText?: boolean,
    avatarTextStyle?: TextStyle,
    showBlurredBackground?: function,
    shouldCloseOnSwipeUp?: boolean,
    hideModal?: boolean
};

export const Story = (props: Props) => {
    const {
        data,
        unPressedBorderColor,
        pressedBorderColor,
        style,
        onStart,
        onClose,
        onStoryNext,
        onStoryPrevious,
        onChange,
        duration,
        swipeText,
        customSwipeUpComponent,
        customCloseComponent,
        avatarSize,
        showAvatarText,
        avatarTextStyle,
        showBlurredBackground,
        shouldCloseOnSwipeUp = true,
        hideModal = false
    } = props;

    const [dataState, setDataState] = useState(data);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [currentStory, setCurrentStory] = useState(0);
    const [selectedData, setSelectedData] = useState([]);
    const cube = useRef();

    // Component Functions
    const _handleStoryItemPress = async (item, index) => {
        let flag = true;
        const newData = dataState;
        if (onStart) {
            flag = await onStart(item)
        }
        if(flag) {
            setCurrentPage(index);
            setSelectedData(newData);
            setIsModalOpen(true);
        }
    };

    useEffect(() => {
        setCurrentStory(0);
    }, [currentPage]);

    function onStoryFinish(state) {
        if (!isNullOrWhitespace(state)) {
            onChange(selectedData[currentPage], currentPage);
            if (state == "next") {
                const newPage = currentPage + 1;
                if (newPage < selectedData.length) {
                    setCurrentPage(newPage);
                    cube?.current?.scrollTo(newPage);
                } else {
                    setIsModalOpen(false);
                    setCurrentPage(0);
                    if (onClose) {
                        onClose(selectedData[selectedData.length - 1]);
                        setCurrentStory(0);
                    }
                }
                if(selectedData[currentPage]){
                    selectedData[currentPage].seen = true;
                }
            } else if (state == "previous") {
                const newPage = currentPage - 1;
                if (newPage < 0) {
                    setIsModalOpen(false);
                    setCurrentPage(0);
                } else {
                    setCurrentPage(newPage);
                    cube?.current?.scrollTo(newPage);
                }
            }
        }
    }

    const renderStoryList = () => selectedData?.map((x, i) => {
        return (<StoryListItem duration={duration * 1000}
                    key={i}
                    currentlyShowing={currentPage === i}
                    profileName={x.user_name}
                    profileImage={x.user_image}
                    stories={x.stories}
                    currentPage={currentPage}
                    currentStory={currentStory}
                    onFinish={onStoryFinish}
                    onNext={(story, index) => {
                        if(currentPage === i) {
                            x.lastSeen = index-1;
                        }
                        console.table(selectedData.map(i => i.lastSeen))
                        setCurrentStory(index)
                        onStoryNext(story, index)
                    }}
                    onPrevious={(story, index) => {
                        if(currentPage === i) {
                            x.lastSeen = index;
                        }
                        console.table(selectedData.map(i => i.lastSeen))
                        setCurrentStory(index)
                        onStoryPrevious(story, index)
                    }}
                    swipeText={swipeText}
                    customSwipeUpComponent={customSwipeUpComponent}
                    customCloseComponent={customCloseComponent}
                    showBlurredBackground={showBlurredBackground}
                    shouldCloseOnSwipeUp={shouldCloseOnSwipeUp}
                    lastSeen={x?.lastSeen || 0}
                    onClosePress={() => {
                        setIsModalOpen(false);
                        if (onClose) {
                            onClose(x);
                            setCurrentStory(0);
                        }
                    }}
                    index={i}
                />
            )
    })

    const renderCube = () => {
        if (Platform.OS == 'ios') {
            return (
                <CubeNavigationHorizontal
                    ref={cube}
                    currentPage={currentPage}
                    callBackAfterSwipe={(x) => {
                        setCurrentStory(0);
                        if (x != currentPage) {
                            setCurrentPage(parseInt(x));
                        }
                    }}
                >
                    {renderStoryList()}
                </CubeNavigationHorizontal>
            )
        } else {
            return (<AndroidCubeEffect
                ref={cube}
                currentPage={currentPage}
                callBackAfterSwipe={(x) => {
                    setCurrentStory(0);
                    if (x != currentPage) {
                        setCurrentPage(parseInt(x));
                    }
                }}
            >
                {renderStoryList()}
            </AndroidCubeEffect>)
        }
    }

    return (
        <Fragment>
            <View style={style}>
                <StoryCircleListView
                    handleStoryItemPress={_handleStoryItemPress}
                    data={dataState}
                    avatarSize={avatarSize}
                    unPressedBorderColor={unPressedBorderColor}
                    pressedBorderColor={pressedBorderColor}
                    showText={showAvatarText}
                    textStyle={avatarTextStyle}
                />
            </View>
            { !hideModal && (
                <Modal
                    style={{
                        flex: 1,
                        height: Dimensions.get("window").height,
                        width: Dimensions.get("window").width
                    }}
                    isOpen={isModalOpen}
                    onClosed={() => {
                        setIsModalOpen(false);
                        setCurrentStory(0);
                    }}
                    position="center"
                    swipeToClose
                    swipeArea={250}
                    backButtonClose
                    coverScreen={true}
                >
                    {renderCube()}
                </Modal>
            )}
        </Fragment>
    );
};
export default Story;

Story.defaultProps = {
    showAvatarText: true
}