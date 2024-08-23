import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface Notification {
  _id: string;
  read: boolean;
  type: string;
  senderId: {
    ProfilePic: string;
    UserName: string;
  };
  postId?: {
    fileUrl?: string;
    content: string;
  };
  msgCount?: number;
}

interface Props {
  notifications: Notification[];
  darkMode: boolean;
  clearAllNotifi: () => void;
  delAllNotifi: () => void;
  notifictionBtn: (id: string, type: string) => void;
}

const NotificationComponent: React.FC<Props> = ({
  notifications,
  darkMode,
  clearAllNotifi,
  delAllNotifi,
  notifictionBtn,
}) => {
  const windowWidth = Dimensions.get('window').width;
  
  return (
    <View style={[styles.container]}>
      <View style={styles.header}>
        <Text
          style={[
            styles.headerText,
            {color: darkMode ? '#FFFFFF' : '#000000'},
          ]}>
          Notification
        </Text>
        <View style={styles.headerActions}>
          <Text
            onPress={clearAllNotifi}
            style={[
              styles.markAllRead,
              {color: darkMode ? '#FFFFFF' : '#000000'},
            ]}>
            Mark all read
          </Text>
          <MaterialCommunityIcons
            name="delete-sweep"
            size={18}
            onPress={delAllNotifi}
            color={darkMode ? '#FFFFFF' : '#000000'}
          />
        </View>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <Text
            style={[
              styles.noNotifications,
              {color: darkMode ? '#FFFFFF' : '#000000'},
            ]}>
            No new notifications
          </Text>
        ) : (
          <>
            {notifications.map((notification: any) => (
              <TouchableOpacity
                key={notification._id}
                onPress={() =>
                  notifictionBtn(notification._id, notification.type)
                }
                style={[
                  styles.notificationItem,
                  {backgroundColor: notification.read ? '#E0E0E0' : '#FFFFFF'},
                ]}>
                <View style={styles.notificationContent}>
                  <Image
                    source={{uri: notification.senderId.ProfilePic}}
                    style={styles.avatar}
                  />
                  {notification.type === 'message' && (
                    <Text style={styles.notificationText}>
                      New message from
                    </Text>
                  )}
                  <Text style={[styles.notificationText, styles.boldText]}>
                    {notification?.senderId?.UserName
                      ? notification?.senderId?.UserName.toString()
                      : ''}
                  </Text>
                  <Text style={styles.notificationText}>
                    {notification.type === 'like'
                      ? 'liked your post'
                      : notification.type === 'comment'
                      ? 'commented on your post'
                      : notification.type === 'follow'
                      ? 'started following you'
                      : ''}
                  </Text>
                  {notification.postId && (
                    <View style={styles.mediaContainer}>
                      {notification.postId.fileUrl ? (
                        (() => {
                          const extension = notification.postId.fileUrl
                            .split('.')
                            .pop()
                            .toLowerCase();
                          if (
                            ['jpg', 'jpeg', 'png', 'gif'].includes(extension)
                          ) {
                            return (
                              <Image
                                source={{uri: notification.postId.fileUrl}}
                                style={styles.media}
                              />
                            );
                          } else if (extension === 'mp4') {
                            return (
                              <Text> Video</Text>
                            );
                          } else if (extension === 'mp3') {
                            return (
                              <Text> Audio</Text>
                            );
                          } else {
                            return <Text>Unsupported file format</Text>;
                          }
                        })()
                      ) : (
                        <>
                          {notification.postId?.content ? (
                            <Text style={styles.notificationText}>
                              {notification.postId.content
                                .split(' ', 10)
                                .join(' ')
                                .toString()}
                              {notification.postId.content.split(' ').length >
                              10
                                ? '...'
                                : ''}
                            </Text>
                          ) : null}
                        </>
                      )}
                    </View>
                  )}

                  {notification.type === 'message' &&
                    notification.msgCount > -1 && (
                      <View style={styles.messageCount}>
                        <Text style={styles.messageCountText}>
                          {notification.msgCount.toString()}
                        </Text>
                      </View>
                    )}
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 0,
    maxHeight: 630,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'static',
    top: 0,
    backgroundColor: 'inherit',
    zIndex: 1,
  },
  headerText: {
    fontSize: 24,
    marginRight: 15,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllRead: {
    marginRight: 8,
    marginTop: 2,
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollView: {
    marginTop: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  noNotifications: {
    fontSize: 14,
    color: '#888',
  },
  notificationItem: {
    padding: 8,
    borderRadius: 10,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  notificationText: {
    marginHorizontal: 2,
    fontSize: 12,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  mediaContainer: {
    marginLeft: 'auto',
    marginRight: 8,
  },
  media: {
    width: 40,
    height: 40,
    borderRadius: 5,
  },
  messageCount: {
    backgroundColor: 'red',
    width: 14, // Set width and height to be equal
    height: 14,
    borderRadius: 12, // Half of the width/height to make it a circle
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  messageCountText: {
    color: 'white',
    fontSize: 10,
  },
});

export default NotificationComponent;
