import React from 'react';
import { Text, View ,ScrollView,FlatList, Modal, StyleSheet , Button, Alert, PanResponder, Share} from 'react-native';
import { Card , Icon, Rating, Input} from 'react-native-elements';
import { Component } from 'react';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite , addComment, postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';



const mapStateToProps = state => {
    return {
      dishes: state.dishes,
      comments: state.comments,
      favorites:state.favorites
    }
  }


const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    addComment:(dishId, rating, comment, author) =>dispatch(addComment(dishId, rating, comment, author)),
   postComment:(dishId, rating, comment, author) => dispatch(postComment(dishId, rating, comment, author))

});



function RenderDish(props) {

    const dish = props.dish;

    handleViewRef = ref => this.view = ref;

    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if ( dx < -200 )
            return true;
        else
            return false;
    }
    const recognizeComment = ({ moveX, moveY, dx, dy }) => {
       if (dx > 200)
         return true;
       else
         return false;
     };

    const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (e, gestureState) => {
                return true;
            },
            onPanResponderGrant: () => {
              this.view.rubberBand(1000).then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));
            },
            onPanResponderEnd: (e, gestureState) => {
                console.log("pan responder end", gestureState);
                if (recognizeDrag(gestureState)){
                    Alert.alert(
                        'Add Favorite',
                        'Are you sure you wish to add ' + dish.name + ' to favorite?',
                        [
                        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                        {text: 'OK', onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}},
                        ],
                        { cancelable: false }
                    );
}else if (recognizeComment(gestureState)) {
                    props.onSelect();
                  }
                return true;
            }
        });

        const shareDish = (title, message, url) => {
                Share.share({
                    title: title,
                    message: title + ': ' + message + ' ' + url,
                    url: url
                },{
                    dialogTitle: 'Share ' + title
                });
            }
        if (dish != null) {
            return(
              <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
              ref = {this.handleViewRef}
               {...panResponder.panHandlers}>
                <Card
                featuredTitle={dish.name}
                image={{uri: baseUrl + dish.image}}>
                    <Text style={{margin: 10}}>
                        {dish.description}
                    </Text>
                    <View style={{flexDirection: 'row', justifyContent: 'center',}}>
                <Icon
                   raised
                   reverse
                   name={ props.favorite ? 'heart' : 'heart-o'}
                   type='font-awesome'
                   color='#f50'
                   onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}
                   />
                   <Icon
                        raised
                        reverse
                        name = {'pencil'}
                        type = 'font-awesome'
                        color = '#512DA8'
                        onPress = {() => props.onSelect()}
                        />
                        <Icon
                            raised
                            reverse
                            name='share'
                            type='font-awesome'
                            color='#51D2A8'
                            style={styles.cardItem}
                            onPress={() => shareDish(dish.name, dish.description, baseUrl + dish.image)} />
                        </View>
                </Card>
                </Animatable.View>
            );
        }
        else {
            return(<View></View>);
        }
}


function RenderComments(props) {

    const comments = props.comments;

    const renderCommentItem = ({item, index}) => {

        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Text style={{fontSize: 12}}>{item.rating} Stars</Text>
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };

    return (
       <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
        <Card title='Comments' >
        <FlatList
            data={comments}
            renderItem={renderCommentItem}
            keyExtractor={item => item.id.toString()}
            />
        </Card>
        </Animatable.View>
    );
}



class Dishdetail extends Component {

  constructor(props) {
          super(props);
          this.state = {
              rating: 0,
              author: '',
              comment: '',
              showCommentModal: false
          }
          this.toggleCommentModal = this.toggleCommentModal.bind(this);
    this.ratingCompleted = this.ratingCompleted.bind(this);
      }
    markFavorite(dishId) {
        this.props.postFavorite(dishId);
    }
    static navigationOptions = {
     title: 'Dish Details'
 };
 toggleCommentModal() {
       this.setState({showCommentModal: !this.state.showCommentModal})
   }

   handleComment(dishId) {
       //console.log(JSON.stringify(this.state));
       this.toggleCommentModal();
       this.props.postComment(dishId, this.state.rating, this.state.comment, this.state.author);
   }
   toggleCommentModal() {
  this.setState({ showCommentModal: !this.state.showCommentModal });
}

ratingCompleted(rating) {
  this.setState({
    'rating': rating
  });
}
render(){
  const dishId = this.props.navigation.getParam('dishId','');
  return(
    <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPress={() => this.markFavorite(dishId)}
                    onSelect = {() => this.toggleCommentModal()}
                    />
                    <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
                    <Modal animationType = {"slide"} transparent = {false}
                              visible = {this.state.showCommentModal}
                              onRequestClose = {() => this.toggleModal() }>
                        <View style={styles.modal}>
                          <Rating
                            showRating
                            ratingCount={5}
                            style={{ paddingVertical: 10 }}
                            startingValue={this.state.rating}
                            onFinishRating={this.ratingCompleted}
                          />
                          <Input
                            placeholder='Author'
                            value={this.state.author}
                            onChangeText={(text) => this.setState({author: text})}
                            leftIcon={
                              <Icon
                                name='user'
                                type='font-awesome'
                                size={24}
                                color='black'
                                containerStyle={{margin: 10}}
                              />
                            }
                          />
                          <Input
                            placeholder='Comment'
                            value={this.state.comment}
                            onChangeText={(text) => this.setState({comment: text})}
                            leftIcon={
                              <Icon
                                name='comments'
                                type='font-awesome'
                                size={24}
                                color='black'
                                containerStyle={{margin: 10}}
                              />
                            }
                          />
                          <Button
                            onPress={() => { this.handleComment(dishId); } }
                            color='#512DA8'
                            raised
                            title='Submit'
                          />
                          <Button
                            onPress={() => { this.toggleCommentModal(); } }
                            title='Cancel'
                          />
                        </View>
                      </Modal>

            </ScrollView>
    );
}

}
const styles = StyleSheet.create({
    formRow: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
        margin: 28
    },
    formLabel: {
        fontSize: 18,
        flex: 2
    },
    formItem: {
        flex: 1
    },
    modal: {
        justifyContent: 'center',
        margin: 20
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: '#512DA8',
        textAlign: 'center',
        color: 'white',
        marginBottom: 20
    },
    modalText: {
        fontSize: 18,
        margin: 10
    }
});
export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);
