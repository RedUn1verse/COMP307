const MeetingModel        = require('../models/meetingmodel');
const UserModel        = require('../models/usermodel');
const MeetingDto          = require('../dtos/meetingdto');
const EmailService = require('../services/emailservice.js');
const SlotModel = require('../models/slotmodel.js');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const isValidDate = (s) => typeof s === 'string' && dayjs(s, 'YYYY-MM-DD', true).isValid();
const isValidTime = (s) => typeof s === 'string' && dayjs(s, 'HH:mm', true).isValid();

const MeetingRequestController = {

  
  async create(req, res) {

    const me = await UserModel.findById(req.params.userId);

    // ========== VALIDATION ================
    const { ownerEmail,title, message, date, startTime, endTime } = req.body ?? {};
    const errors = [];
    if (typeof ownerEmail !== 'string' || !ownerEmail.trim()) errors.push('ownerEmail is required');
    if (typeof title !== 'string' || !title.trim()) errors.push('title is required');
    if (typeof message    !== 'string' || !message.trim())    errors.push('message is required');
    if (!isValidDate(date)) errors.push('date must be a valid YYYY-MM-DD format');
    if (!isValidTime(startTime)) errors.push('startTime must be a valid HH:mm format');
    if (!isValidTime(endTime)) errors.push('endTime must be a valid HH:mm format');
    if (isValidTime(startTime) && isValidTime(endTime) && startTime >= endTime) {
      errors.push('startTime must be before endTime');
    }

    const owner = await UserModel.findByEmail(ownerEmail.trim());
    if (!owner || owner.role !== 'owner') return res.status(404).json({ error: 'Owner not found' });
    if (owner.userId === me.userId)       return res.status(400).json({ error: 'Cannot request a meeting with yourself' });

    
    
    if (errors.length) return res.status(400).json({ error: errors[0] });


    // ========== MAIN fct ================
    meeting = await MeetingModel.create(me.userId, owner.userId, message.trim(), title.trim(), date, startTime, endTime );
    enrichedMeeting = {...meeting, ownerName: owner.name};

    const to = owner.email;
    const subject = `New meeting request from ${me.name}`;
    const body = `${me.name} has requested a meeting on ${date} from ${startTime} to ${endTime}.\n\n` +
        `Title:\n${title.trim()}\n\n` +
        `Message:\n${message.trim()}\n\n` +
        `Review it on your dashboard.`;

    const url = EmailService.buildMailto(to, subject, body);

    res.status(201).json({ ...MeetingDto.responseForUser(enrichedMeeting), url});
  },


  async getMe(req, res) {
    const user = await UserModel.findById(req.params.userId);

    meetingIds = user.requestMeetingIds
  
    meetings = await MeetingModel.getMeetings(meetingIds);

    if (user.role === "user") {
      
      enrichedMeetings = await UserModel.enrichListOwnerName(meetings)
      res.status(200).json(MeetingDto.responseListForUser(enrichedMeetings))
    };
    
    if (user.role ==="owner") { 
      enrichedMeetings = await UserModel.enrishListUserName(meetings)
      res.status(200).json(MeetingDto.responseListForOwner(enrichedMeetings))
    };
  },

  async decline(req, res) {
   
    const r = await MeetingModel.findById(req.params.meetingId);
    if (!r) return res.status(409).json("Meeting Already Declined");
    if (r.ownerId !== req.params.userId) return res.status(403).json({ error: 'Only the addressed owner can decline' });

    const declined = await MeetingModel.decline(req.params.meetingId);

    oDeclined = await UserModel.enrichOwnerName(declined);
    uDeclined = await UserModel.enrichUserName(declined);
    eDeclined = await UserModel.enrichUserEmail(declined);

    const to = eDeclined.userEmail;
    const subject = `Your meeting request with ${oDeclined.ownerName} was declined`;
    const body = `${oDeclined.ownerName} is unable to take the meeting on ` +
        `${declined.date} from ${declined.startTime} to ${declined.endTime}.`;

    const url = EmailService.buildMailto(to, subject, body);

    res.status(200).json({ ...MeetingDto.responseForOwner(uDeclined), url});

  },

  async accept(req, res) {
    const r = await MeetingModel.findById(req.params.meetingId);
    if (!r) return res.status(404).json({ error: 'Meeting not found' });
    if (r.ownerId !== req.params.userId) return res.status(403).json({ error: 'Only the addressed owner can accept' });

    const accepted = await MeetingModel.accept(req.params.meetingId);
    

    oAccepted = await UserModel.enrichOwnerName(accepted);
    uAccepted = await UserModel.enrichUserName(accepted);
    eAccepted = await UserModel.enrichUserEmail(accepted);

    const to = eAccepted.userEmail;
    const subject = `Your meeting request with ${oAccepted.ownerName} was accepted`;
    const body = `${oAccepted.ownerName} will see you on ` +
        `${accepted.date} from ${accepted.startTime} to ${accepted.endTime}.`;

    const url = EmailService.buildMailto(to, subject, body);

    res.status(200).json({ ...MeetingDto.responseForOwner(uAccepted), url});

   
  },



};

module.exports = MeetingRequestController;
