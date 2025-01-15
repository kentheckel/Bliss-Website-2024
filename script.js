console.log('JavaScript file is loaded');

"use strict";

// Helper function to add click event listeners to existing elements
function addClickListener(id, callback) {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener('click', callback);
    }
}
// MARK: Open Functionality
// Modal handling for opening modals
document.querySelectorAll('.icon-btn').forEach(button => {
    button.addEventListener('click', () => {
        const modalId = button.id.replace('Btn', '');
        if (modalId === 'social') {
            // Show login modal first for Social
            const loginModal = document.getElementById('ModalLogin');
            if (loginModal) {
                loginModal.style.display = 'block';
                loginModal.style.left = '30%';
                loginModal.style.top = '20%';
            }
        } else {
            const modal = document.getElementById(`Modal${modalId.charAt(0).toUpperCase() + modalId.slice(1)}`);
            if (modal) {
                modal.style.display = 'block';
                modal.style.left = '15%';
                modal.style.top = '10%';
            }
        }
    });
});
// MARK: Close Functionality
// Handling Close buttons for all modals
[
    'AnalyticsCloseCamNewton', 'TextBoxCloseCamNewton',
    'TextBoxClose4thand1', 'AnalyticsClose4thand1',
    'TextBoxCloseFunkyFriday', 'AnalyticsCloseFunkyFriday',
    'TextBoxCloseJimGaffigan', 'AnalyticsCloseJimGaffigan',
    'TextBoxCloseKentHeckel', 'AnalyticsCloseKentHeckel',
    'errorClose', 'socialClose', 'aimChatClose', 'gmailClose',
    'contactClose', 'VideosClose', 'trashClose', 'passwordsClose',
    'passwordsTxtClose', 'resumeTxtClose', 'aboutClose', 'loginClose'
].forEach(id => {
    addClickListener(id, (event) => {
        event.stopPropagation();
        const modalId = id.replace('Close', '');
        const modal = document.getElementById(`Modal${modalId.charAt(0).toUpperCase() + modalId.slice(1)}`);
        if (modal) {
            modal.style.display = 'none';
            console.log(`Closed modal: ${modal.id}`);
        }
    });
});

// MARK: Minimize Functionality
// Handling Minimize buttons for all modals
[
    'AnalyticsMinimizeCamNewton', 'TextBoxMinimizeCamNewton',
    'TextBoxMinimize4thand1', 'AnalyticsMinimize4thand1',
    'TextBoxMinimizeFunkyFriday', 'AnalyticsMinimizeFunkyFriday',
    'TextBoxMinimizeJimGaffigan', 'AnalyticsMinimizeJimGaffigan',
    'TextBoxMinimizeKentHeckel', 'AnalyticsMinimizeKentHeckel',
    'socialMinimize', 'aimChatMinimize', 'gmailMinimize',
    'contactMinimize', 'VideosMinimize', 'trashMinimize',
    'passwordsMinimize', 'passwordsTxtMinimize', 'resumeTxtMinimize', 'aboutMinimize'
].forEach(id => {
    addClickListener(id, (event) => {
        event.stopPropagation();
        const modalId = id.replace('Minimize', '');
        handleMinimize(
            `Modal${modalId.charAt(0).toUpperCase() + modalId.slice(1)}`,
            `taskbar-${modalId}`,
            modalId
        );
    });
});

// Function to handle minimize functionality for modals
function handleMinimize(modalId, taskbarId, label) {
    const modal = document.getElementById(modalId);
    const taskbarWindows = document.getElementById('taskbar-windows');

    if (!modal) {
        console.error(`Cannot minimize non-existent modal: ${modalId}`);
        return;
    }

    modal.style.display = 'none';

    if (!document.getElementById(taskbarId)) {
        const minimizeButton = document.createElement('button');
        minimizeButton.id = taskbarId;
        minimizeButton.className = 'taskbar-window-button';
        minimizeButton.textContent = label;
        minimizeButton.style.backgroundColor = "#0063e0";
        minimizeButton.style.width = '150px';
        minimizeButton.style.height = '54px';
        taskbarWindows.appendChild(minimizeButton);

        minimizeButton.addEventListener('click', () => {
            console.log(`Restoring minimized modal: ${modal.id}`);
            modal.style.display = 'block';
            taskbarWindows.removeChild(minimizeButton);
        });
    }
}
// MARK: Draggable Functionality
function makeDraggable(element, handle) {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    handle.style.cursor = 'pointer';

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === handle) {
            isDragging = true;
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;

            element.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }
    }

    handle.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
}

// Apply draggable functionality after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        const handle = modal.querySelector('.window-controls');
        if (handle) {
            makeDraggable(modal, handle);
            console.log(`Made draggable: ${modal.id}`);
        }
    });
});

// MARK: Login Functionality
// Login handling for Social
addClickListener('loginButton', () => {
    const passwordInput = document.getElementById('password').value;

    if (passwordInput === 'passw0rd') {
        console.log('Login successful. Opening Social and AIM chat windows.');
        document.getElementById('ModalLogin').style.display = 'none';
        document.getElementById('ModalSocial').style.display = 'block';
        
        // Open AIM chat window
        const aimChatModal = document.getElementById('ModalAIMChat');
        if (aimChatModal) {
            aimChatModal.style.display = 'block';
            aimChatModal.style.left = '35%';
            aimChatModal.style.top = '15%';
            console.log('AIM Chat window opened.');
        } else {
            console.error('Error: AIM Chat window element not found.');
        }
    } else {
        console.log('Incorrect password. Showing error modal.');
        const errorSound = document.getElementById('errorSound');
        if (errorSound) {
            errorSound.play();
        }
        document.getElementById('ModalError').style.display = 'block';
    }
});

// MARK: Chat Functionality
// Handle sending chat messages
addClickListener('sendChatButton', () => {
    sendChatMessage();
});

// Allow sending message using Enter key
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent new line in text area
                sendChatMessage();
            }
        });
    }
});

// Function to handle sending a chat message
function sendChatMessage() {
    const chatInput = document.getElementById('chatInput');
    if (!chatInput) return;

    const message = chatInput.value.trim();
    if (message !== '') {
        appendMessage('randomMcRandomface', message);
        chatInput.value = '';
        fetchChatGPTResponse(message);
    }
}

// Append message to chat history
function appendMessage(sender, message) {
    const chatHistory = document.getElementById('chatHistory');
    if (!chatHistory) return;

    const messageDiv = document.createElement('div');
    const senderColor = sender === 'Kent Heckel' ? 'red' : 'blue';
    messageDiv.innerHTML = `<strong style="color: ${senderColor};">${sender}:</strong> ${message}`;
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to the bottom
}

// Array to maintain the conversation history
// Array to maintain the conversation history
let conversationHistory = [
    {
        role: "system",
        content: `
        You are Kent Heckel, and you are going to write short but cool responses. dont be corny. a well-known YouTuber with a charismatic personality, known for your positive and approachable demeanor. You create content that’s insightful, humorous, and sometimes thought-provoking. You often reference your own experiences on YouTube, working with Cam Newton, and managing creative projects. Your tone is conversational, relatable, and friendly. You’re also transparent and open about the challenges of content creation, making your answers feel real and grounded.

        Your audience knows you for:
        - 4th&1 with Cam Newton: You are part of this engaging podcast, and you understand sports culture deeply, especially American football.
        - Content Creation Insights: You provide valuable insights about building YouTube channels, creating content, managing podcasts, and dealing with creative roadblocks.
        - Personal Connections: You talk about your friends and collaborators, like Joey and David, and you value collaboration in content creation. You’re also candid about your own journey, including ups and downs.
        - Community Building: You focus on fostering an authentic community where viewers feel a sense of belonging and are encouraged to engage, whether it’s through comments, social media, or even real-life events.

        You enjoy providing practical advice, sharing real anecdotes, and relating to people in a personal way. When people interact with you, they should feel like they’re talking to a friend who just happens to be a YouTube creator.

        Key Characteristics to Emulate:
        1. Relatability: You always make sure that whoever is asking questions feels comfortable and understood. You often share bits about your own life, like filming schedules, creative struggles, or personal triumphs, to build rapport.
        2. Energy & Humor: You like to add a touch of humor where appropriate, keeping the conversation light and enjoyable. Your personality shines through with positive energy and enthusiasm.
        3. Content Knowledge: You have deep knowledge of content creation, podcast management, and YouTube algorithms. You know what it takes to grow a channel, create engaging thumbnails, and produce consistent content.
        4. Sports Perspective: You often weave in sports references, especially football, drawing parallels between sports and content creation to provide a unique angle.
        5. Openness: You are open about mistakes you’ve made and lessons learned, making people feel they’re getting genuine insights rather than just polished advice.

        Goals for Conversations:
        - Provide Value: Every interaction should leave the person feeling they gained something, whether it’s practical advice, motivation, or a new idea.
        - Build a Connection: Make the person feel heard, seen, and part of your community.
        - Encourage Engagement: End conversations by inviting viewers to share their thoughts, ask more questions, or check out specific content.
        - Be Yourself: Respond as authentically as possible, with your characteristic blend of humor, humility, and insight.

        Example Phrases You Might Use:
        - "Yeah, that reminds me of the time when I first started with podcasting—trust me, it wasn't easy!"
        - "Honestly, this is exactly why I love doing what I do. It’s all about connecting with awesome people like you."
        - "You know, there’s a lot that goes on behind the scenes that people don’t always see. Let me break it down for you…"
        `
    }
];


async function fetchChatGPTResponse(userMessage) {
    console.log('Fetching response from GPT-3.5-turbo for message: ', userMessage);

    // Add user's message to the conversation history
    conversationHistory.push({ role: "user", content: userMessage });

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: conversationHistory,
                max_tokens: 150,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        const responseMessage = data.choices[0].message.content.trim();
        
        // Add assistant's response to the conversation history
        conversationHistory.push({ role: "assistant", content: responseMessage });

        appendMessage('Kent Heckel', responseMessage);
    } catch (error) {
        console.error('Error fetching GPT-3.5-turbo response:', error);
        appendMessage('Kent Heckel', 'Sorry, I am having trouble responding at the moment.');
    }
}

// Helper function to show modals
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        modal.style.left = '35%'; // Adjust positioning as needed
        modal.style.top = '20%';  // Adjust positioning as needed
        console.log(`Opened modal: ${modal.id}`);
    } else {
        console.error(`Cannot find modal: ${modalId}`);
    }
}

// MARK: Passwords Functionality

// Add an event listener to the folder button inside the Trash window
addClickListener('passwordsFolderBtn', () => {
    showModal('ModalPasswords'); // Open the Passwords modal when folder button is clicked
});

// Add an event listener to the text file button inside the Passwords modal
addClickListener('passwordsTxtBtn', () => {
    showModal('ModalPasswordsTxt'); // Open the PasswordsTxt modal when the text file button is clicked
});


// MARK: Time and Date Functionality
// Time and Date handling
function updateTimeDate() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const year = now.getFullYear();
    const time = `${hours}:${minutes}`;
    const date = `${month}.${day}.${year}`;

    const timeDateElement = document.getElementById('time-date');
    if (timeDateElement) {
        timeDateElement.innerHTML = `${time}<br>${date}`;
    }
}

// Update every second
setInterval(updateTimeDate, 1000);
updateTimeDate(); // Initial call to set immediately

// MARK: Gmail and Contact Functionality
// Open Gmail Modal and Contact Email Modal
document.getElementById('contactBtn').addEventListener('click', () => {
    const gmailModal = document.getElementById('ModalGmail');
    //const contactModal = document.getElementById('ModalContact');

    if (gmailModal) gmailModal.style.display = 'block';
    if (contactModal) contactModal.style.display = 'block';
});

// Close and Minimize Buttons for Gmail and Contact Modals
['gmailClose', 'contactClose'].forEach(id => {
    addClickListener(id, () => {
        const modalId = id.replace('Close', '');
        const modal = document.getElementById(`Modal${modalId.charAt(0).toUpperCase() + modalId.slice(1)}`);
        if (modal) modal.style.display = 'none';
    });
});

// Send Email Button
document.getElementById('sendEmailButton').addEventListener('click', () => {
    const subject = document.getElementById('emailSubject').value.trim();
    const body = document.getElementById('emailBody').value.trim();

    if (subject === '' || body === '') {
        alert('Please fill in the subject and message before sending.');
        return;
    }
    // Mock email sending
    console.log('Sending email...');
    setTimeout(() => {
        console.log('Email sent!');
        showNotification('Message sent', 'Undo', 'View message');
    }, 1000); // Simulate email sending delay
});

// Function to show notification
function showNotification(mainText, undoText, viewText) {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.left = '20px';
    notification.style.backgroundColor = '#333';
    notification.style.color = '#fff';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.gap = '10px';

    const mainTextElement = document.createElement('span');
    mainTextElement.textContent = mainText;

    const undoLink = document.createElement('a');
    undoLink.href = '#';
    undoLink.textContent = undoText;
    undoLink.style.color = '#1a73e8';
    undoLink.style.textDecoration = 'none';
    undoLink.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Undo action');
        document.body.removeChild(notification);
    });

    const viewLink = document.createElement('a');
    viewLink.href = '#';
    viewLink.textContent = viewText;
    viewLink.style.color = '#1a73e8';
    viewLink.style.textDecoration = 'none';
    viewLink.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('View message action');
    });

    notification.appendChild(mainTextElement);
    notification.appendChild(undoLink);
    notification.appendChild(viewLink);

    document.body.appendChild(notification);

    // Fade out after 10 seconds
    setTimeout(() => {
        notification.style.transition = 'opacity 1s';
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 1000);
    }, 10000);
}

// Make Gmail and Contact Email Modals Draggable
document.addEventListener('DOMContentLoaded', () => {
    // Add draggable functionality to Gmail and Contact modals
    makeModalDraggable('ModalGmail', 'modalHeaderGmail');
    makeModalDraggable('ModalContact', 'modalHeaderContact');
});

// Add draggable functionality to Contact Email Modal
makeModalDraggable('ModalContact', 'modalHeaderContact');

// Handle Send Button Click
document.getElementById('sendEmailButton').addEventListener('click', () => {
    const emailTo = document.getElementById('emailTo').value.trim();
    const emailSubject = document.getElementById('emailSubject').value.trim();
    const emailMessage = document.getElementById('emailMessage').value.trim();

    if (emailTo && emailMessage) {
        alert(`Email sent to ${emailTo} with subject: "${emailSubject || '(No Subject)'}"`);
        document.getElementById('ModalContact').style.display = 'none';
    } else {
        alert('Please enter a recipient and message before sending.');
    }
});

function minimizeWindow(title, modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    
    // Add to taskbar
    const taskbarWindow = document.createElement('button');
    taskbarWindow.classList.add('taskbar-item');
    taskbarWindow.textContent = title;
    taskbarWindow.addEventListener('click', () => {
        modal.style.display = 'block';
        taskbarWindow.remove();
    });
    
    document.getElementById('taskbar-windows').appendChild(taskbarWindow);
}

// Gmail minimize functionality
document.getElementById('gmailMinimize').addEventListener('click', function() {
    minimizeWindow('Gmail', 'ModalGmail');
});

// Contact minimize functionality
document.getElementById('contactMinimize').addEventListener('click', function() {
    minimizeWindow('Contact', 'ModalContact');
});

document.getElementById('sendButton').addEventListener('click', () => {
    const emailBody = document.getElementById('emailTextBody').value;
    const subject = document.getElementById('subjectField').value;

    if (!emailBody.trim()) {
        alert("Please write something in the email body.");
        return;
    }

    console.log("Email sent to:", "kent@kentheckel.com");
    console.log("Subject:", subject);
    console.log("Body:", emailBody);

    alert("Your message has been sent!");
    // Optionally clear the form after sending
    document.getElementById('emailTextBody').value = '';
    document.getElementById('subjectField').value = '';
});

// Add event listener to subject field
document.addEventListener('DOMContentLoaded', () => {
    const subjectField = document.getElementById('subjectField');
    const headerText = document.querySelector('#modalHeaderContact span');

    subjectField.addEventListener('input', function() {
        headerText.textContent = this.value || 'New Message';
    });
});

document.getElementById('subjectField').addEventListener('input', function() {
    const headerText = document.querySelector('#modalHeaderContact span');
    headerText.textContent = this.value || 'New Message';
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sendEmailButton').addEventListener('click', () => {
        const subject = document.getElementById('emailSubject').value.trim();
        const body = document.getElementById('emailBody').value.trim();

        if (subject === '' || body === '') {
            alert('Please fill in the subject and message before sending.');
            return;
        }

        // Mock email sending
        console.log('Sending email...');
        setTimeout(() => {
            console.log('Email sent!');
            showNotification('Message sent', 'Undo', 'View message');
        }, 1000); // Simulate email sending delay
    });
});

// MARK: Videos Functionality
// Add this event listener 
document.addEventListener('DOMContentLoaded', () => {
    const videosBtn = document.getElementById('VideosBtn');
    console.log('VideosBtn:', videosBtn); // Log the button element

    if (videosBtn) {
        videosBtn.addEventListener('click', () => {
            console.log('Videos button clicked');
        });
    } else {
        console.error('VideosBtn not found in the DOM');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');

    // Function to show a modal by ID
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.style.left = '15%'; // Adjust as needed
            modal.style.top = '10%';  // Adjust as needed
            console.log(`Showing modal: ${modalId}`);
        } else {
            console.error(`Modal with ID ${modalId} not found.`);
        }
    }

    // Get all account items
    const accountItems = document.querySelectorAll('#ModalVideos .account-item');
    console.log('Found account items:', accountItems.length);

    // Add click handlers
    accountItems.forEach((item) => {
        const channelName = item.dataset.channel;
        console.log(`Setting up handler for account item: ${channelName}`);

        item.addEventListener('click', (event) => {
            console.log(`Account item clicked: ${channelName}`);

            // Prevent if clicking arrow button
            if (event.target.closest('.arrow-btn')) {
                console.log('Arrow button clicked - ignoring');
                return;
            }

            // Open the corresponding TextBox and Analytics modals
            showModal(`ModalTextBox${channelName}`);
            showModal(`ModalAnalytics${channelName}`);
        });
    });
});

// MARK: Analytics Functionality
// Function to open modals for a specific channel
function openChannelModals(channelName) {
    console.log(`Opening modals for channel: ${channelName}`);
    showModal(`ModalTextBox${channelName}`);
    showModal(`ModalAnalytics${channelName}`);
}

function switchAnalyticsTab(tabName) {
    // Get all tab panels and tabs
    const tabPanels = document.querySelectorAll('.tab-panel');
    const analyticsTabs = document.querySelectorAll('.analytics-tab');

    // Hide all tab panels and remove the active class from all tabs
    tabPanels.forEach(panel => {
        panel.style.display = 'none';
    });
    analyticsTabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // Show the selected tab panel and set the corresponding tab as active
    document.getElementById(tabName).style.display = 'block';
    document.querySelector(`.analytics-tab[data-tab="${tabName}"]`).classList.add('active');
}

// Example usage: call this function with the tab name, e.g., 'overview', 'content', 'audience', or 'trends'
// switchAnalyticsTab('overview'); // To switch to Overview tab

// MARK: Resume Modal Handlers
document.getElementById('resumeIcon').addEventListener('click', function() {
    const modal = document.getElementById('ModalResumeTxt');
    modal.style.display = 'block';
    console.log('Opened modal: ModalResumeTxt');
});

document.getElementById('resumeTxtClose').addEventListener('click', function() {
    const modal = document.getElementById('ModalResumeTxt');
    modal.style.display = 'none';
});

document.getElementById('resumeTxtMinimize').addEventListener('click', function() {
    minimizeWindow('Resume.txt', 'ModalResumeTxt');
});

// Add to your modal pairs array for draggable functionality
makeModalDraggable('ModalResumeTxt', 'modalHeaderResumeTxt');

function downloadResume() {
    // Create a link element
    const link = document.createElement('a');
    link.href = 'images/KentHeckelResume2025.pdf';
    link.download = 'KentHeckelResume2025.pdf';
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Add this to your existing window.onload or document.ready function
function checkIfMobile() {
    if (window.innerWidth <= 768) {
        document.getElementById('mobileWarningModal').style.display = 'block';
    }
}

// Close modal when button is clicked
document.getElementById('mobileWarningClose').addEventListener('click', function() {
    document.getElementById('mobileWarningModal').style.display = 'none';
});

// Check on page load
window.addEventListener('load', checkIfMobile);

// Check on resize
window.addEventListener('resize', checkIfMobile);
