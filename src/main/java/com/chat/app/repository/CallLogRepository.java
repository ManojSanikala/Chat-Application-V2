package com.chat.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chat.app.model.Message;

@Repository
public interface CallLogRepository
        extends JpaRepository<Message, Long> {

    /*
     * =====================================================
     * GET CALL LOGS FOR USER
     *
     * Finds messages where:
     *
     * messageType = CALL
     *
     * AND
     *
     * User is either:
     * sender
     * OR
     * receiver
     *
     * Latest calls first.
     * =====================================================
     */

    List<Message> findByMessageTypeAndSenderUsernameOrMessageTypeAndReceiverUsernameOrderByIdDesc(

            String messageType1,

            String senderUsername,

            String messageType2,

            String receiverUsername

    );

}