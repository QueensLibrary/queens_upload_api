

var datetime = require('node-datetime');
var express = require('express');
var fs = require("fs");
var multer = require('multer');
var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport");

var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '2048mb'}));
app.use(bodyParser.urlencoded({limit: '2048mb', extended: true}));

// function to encode file data to base64 encoded string
function base64_encode(file) {
     	// read binary data
     	var bitmap = fs.readFileSync(file);
    	// convert binary data to base64 encoded string
    	return new Buffer(bitmap).toString('base64');
}

function base64_decode(base64str, file) {
   	var bitmap = new Buffer(base64str, 'base64');
        fs.writeFile('/opt/vtls/valet/qmp/storage/stage1/'+file,bitmap);
}


app.post('/api/v1/valets',function(req,res){

    	var dt = datetime.create();
    	var filename = "valet-" + dt.format('Ymd-HMS');
    	var attach_file = 'APItemp00000-' + dt.format('HMS');
    
    	var base64str= req.body.userPhoto;//store the base64 encoded string to a var

    	base64_decode(base64str,attach_file);//decode the stored base64 string and save as attach_file

        var injectParams = new Array();

 	//to get the filesize of the attach_file and for xml generation
	fs.watchFile("/opt/vtls/valet/qmp/storage/stage1/"+attach_file, function (curr, prev) {
        
        injectParams['attachId'] = attach_file;
        injectParams['fileSize'] = curr.size;
        injectParams['resourceType'] = req.body.resourceType;
        injectParams['step'] = req.body.step;
        injectParams['email'] = req.body.email;

        injectParams['firstname'] = req.body.firstname;
        injectParams['lastname'] = req.body.lastname;
        injectParams['uploaderfname'] = req.body.uploaderfname;
        injectParams['uploaderlname'] = req.body.uploaderlname;
        injectParams['lang'] = req.body.lang;

        injectParams['right'] = 'Contact digitalarchives@queenslibrary.org for research and reproduction requests. This material may be protected by the U.S. Copyright Law (Title 17,U.S.C.). We welcome you to make fair use of the content accessible on this website as defined by copyright law. Please note that you are responsible for determining whether your use is fair and for responding to any claims that may arise from your use.';

        injectParams['title'] = req.body.title;
        injectParams['memberType'] = req.body.memberType;

        injectParams['submitDate'] = dt.format('Y-m0d-H:M:S');

        /* Separate param by resourceType */ 
        if ( injectParams['resourceType'] == 'Digital Photograph' ) {
	     
 	     injectParams['filename']='mobile.jpg';
             if(req.body.mimeType.includes("jpeg")){
                injectParams['filename']='mobile.jpeg';
             }else if(req.body.mimeType.includes("png")){
                injectParams['filename']='mobile.png';
             }else if(req.body.mimeType.includes("tiff")){
                injectParams['filename']='mobile.tiff';
             }else if(req.body.mimeType.includes("gif")){
                injectParams['filename']='mobile.gif';
             }else if(req.body.mimeType.includes("bmp")){
                injectParams['filename']='mobile.bmp';
             }
             injectParams['additional'] =req.body.additional;
             injectParams['camera'] = req.body.camera;
             injectParams['events'] = req.body.events;
             injectParams['organization'] = req.body.organization;
             injectParams['persons'] = req.body.persons;
             injectParams['photoLocation'] = req.body.photoLocation;
             injectParams['year'] = req.body.year;
       
        } else if ( injectParams['resourceType'] == 'Scanned Material' ) {
	     
             
             injectParams['filename']='mobile.jpg';
             if(req.body.mimeType.includes("jpeg")){
                injectParams['filename']='mobile.jpeg';
             }else if(req.body.mimeType.includes("png")){
                injectParams['filename']='mobile.png';
             }else if(req.body.mimeType.includes("tiff")){
                injectParams['filename']='mobile.tiff';
             }else if(req.body.mimeType.includes("gif")){
                injectParams['filename']='mobile.gif';
             }else if(req.body.mimeType.includes("bmp")){
                injectParams['filename']='mobile.bmp';
             }else if(req.body.mimeType.includes("pdf")){
                injectParams['filename']='mobile.pdf';
             }
             injectParams['scannedLocation'] = req.body.scannedLocation;
             injectParams['measurements']=req.body.measurements;
	     injectParams['additional'] = req.body.additional;
             injectParams['descriptionAbstract'] = req.body.descriptionAbstract;
             injectParams['artifactEvent'] = req.body.artifactEvent;
             injectParams['artifactOrganization'] = req.body.artifactOrganization;
             injectParams['artifactPerson'] = req.body.artifactPerson;
             injectParams['scanner'] = req.body.scanner;
             injectParams['year'] = req.body.year;
       
        } else if ( injectParams['resourceType'] == 'Oral History' ) {
             
             injectParams['filename']='mobile.mp3';
             if(req.body.mimeType.includes("wav")){
                injectParams['filename']='mobile.wav';
             }else if(req.body.mimeType.includes("aac")){
		injectParams['filename']='mobile.aac';
             }else if(req.body.mimeType.includes("mpeg")){
                injectParams['filename']='mobile.mp3';
             }else if(req.body.mimeType.includes("m4a")){
                injectParams['filename']='mobile.m4a';
             }

             injectParams['additional'] = req.body.additional;
             injectParams['faculty'] = req.body.faculty;
             injectParams['interviewDate'] = 'Date Recorded: '+req.body.interviewDate;
             injectParams['interviewLocation'] = 'Location Recorded: '+req.body.interviewLocation;
             injectParams['interviewee'] = req.body.interviewee;
             injectParams['organizationsInterview'] = req.body.organizationsInterview;
             injectParams['peopleInterview'] = req.body.peopleInterview;
             injectParams['placesInterview'] = req.body.placesInterview;
             injectParams['recorderMake'] = req.body.recorderMake; 
             injectParams['year'] = req.body.year; 
        
        } else if ( injectParams['resourceType'] == 'Sound Recording' ) {
             
             injectParams['filename']='mobile.mp3';
             if(req.body.mimeType.includes("wav")){
                injectParams['filename']='mobile.wav';
             }else if(req.body.mimeType.includes("aac")){
                injectParams['filename']='mobile.aac';
             }else if(req.body.mimeType.includes("mpeg")){
                injectParams['filename']='mobile.mp3';
             }else if(req.body.mimeType.includes("m4a")){
                injectParams['filename']='mobile.m4a';
             }

             injectParams['additional'] = req.body.additional;
             injectParams['recorderMake'] = req.body.recorderMake;  // Yes or No 
             injectParams['recordingEvent'] = req.body.recordingEvent;
             injectParams['recordingLocation'] = req.body.recordingLocation;
             injectParams['recordingOrganization'] = req.body.recordingOrganization;
             injectParams['recordingPeople'] = req.body.recordingPeople;
             injectParams['year'] = req.body.year;

        } 
 
        var xml_template = CallStaticVar( injectParams );  

        var data = xml_template;
        var msg = '';
        fs.writeFile( "/opt/vtls/valet/qmp/storage/stage1/" + filename , data  , function (err) {
           res.writeHeader( 200 , {"Content-Type":"application/json"} );
           if ( err ) { 
                msg = "{'Error':'500'\n,'Message:'Failed to upload!'\n}\n";
                return res.end( msg );
           } else {
                msg = "{'Success':'200'\n,'Message':'" + filename + "'\n}\n";
		
		
		/*	
		//if success in successfully uploading send an email to the cataloger with details
		var transporter = nodemailer.createTransport(smtpTransport({
			service: 'Gmail',//email provider
			auth:{
				user:'josephsherpa7@gmail.com',
                                pass:''
			}
		}));
		
		var transporter = nodemailer.createTransport(smtpTransport({
    			host: 'localhost',
    			port: 25,
    			auth: {
        			user: 'username',
        			pass: 'password'
   			}
		}));
		*/
		/*
		var transporter = nodemailer.createTransport(
  		  	smtpTransport('smtps://josephsherpa7%40gmail.com:@smtp.gmail.com')
		);
		
		var mail_date = dt.format('Y-m-d H:M:S');
		var mail_msg = "Submitted on :" + mail_date + "\n"+
			     	"Title: " + req.body.title + "\n"+
                                "Last Name: " + req.body.lastname + "\n"+
				"First Name: " + req.body.firstname + "\n"+
				"Resource Type: " + req.body.resourceType + "\n"+
				"Year: " + req.body.year + "\n"+
				"Additional Info: " + req.body.additional + "\n";
		
		console.log(mail_msg);
		var mailOptions = {
    			from: 'josephsherpa7@gmail.com', // sender address
    			to: 'josephsherpa@yahoo.com', // list of receivers
    			subject: 'New QMP Mobile Upload Submission', // Subject line
    			text: mail_msg 
    	        };
		
		transporter.sendMail(mailOptions, function(error, info){
			if(error){
        			console.log(error);
				res.end("error");
        			//res.json({yo: 'error'});
    			}else{
        			console.log('Message sent: ' + info.response);
				res.end("sent");
        			//res.json({yo: info.response});
    			};
		});
		*/
                return res.end( msg );
           }
        }); 

    });//end of watchfile

});//end of post

app.get('/api/v1/valets',function(req,res){
   res.writeHeader(200,{"Content-Type":"application/json"});
   res.write( "{'Success':'200'}" );
   res.end();
});

app.get('/', function (req, res) {
   res.writeHeader(200,{"Content-Type":"application/json"});
   res.write( "{'Success':'200'}" );
   res.end();
});

//api to return status alert to the mobile application
app.get('/api/v1/valets/mobile_status',function(req,res){
   res.writeHeader(200,{"Content-Type":"application/json"});
   //res.write( '{"messages": [{"title": "Library Closed","body": "Queens Library will be closed next Monday"}, {"title": "QMP Live","body": "QMP will go live this week"}]}');
   res.write( '{"messages": []}');
   res.end();
});

var server = app.listen( 8081, function () {

  var host = server.address().address;
  console.log( __dirname );
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);

});




function CallStaticVar( inParams ) {

  var INFO = new Array();
  INFO['resourceType'] = inParams['resourceType'];
  INFO['step'] = inParams['step'];
  
  if ( inParams['attachId'] != '' ) {
       INFO['attachId'] = inParams['attachId'];
       INFO['fileSize'] = inParams['fileSize'];
       INFO['filename'] = inParams['filename']; 
  } else {
       INFO['attachId'] = "";
       INFO['fileSize'] = "";
       INFO['filename'] = ""; 
  }

  INFO['firstname'] = inParams['firstname'];
  INFO['lastname'] = inParams['lastname'];
  INFO['uploaderfname'] = inParams['uploaderfname'];
  INFO['uploaderlname'] = inParams['uploaderlname'];
  

  INFO['lang'] = inParams['lang'];
  INFO['email']=inParams['email'];

  INFO['right'] = inParams['right']; 
  INFO['title'] = inParams['title'];
  INFO['memberType'] = inParams['memberType'];

  INFO['submitDate'] = inParams['submitDate'];
  
  var xml_template = '';
  if ( INFO['resourceType'] == 'Digital Photograph' ) {

       INFO['additional'] = inParams['additional']; 
       INFO['camera'] = inParams['camera']; 
       INFO['events'] = inParams['events']; 
       INFO['organization'] = inParams['organization']; 
       INFO['persons'] = inParams['persons']; 
       INFO['photoLocation'] = inParams['photoLocation']; 
       INFO['year'] = inParams['year']; 

       xml_template = DigitalPhoto( INFO );
  } else if ( INFO['resourceType'] == 'Scanned Material' ) {
       INFO['scannedLocation'] = inParams['scannedLocation'];
       INFO['measurements'] = inParams['measurements'];  
       INFO['additional'] = inParams['additional'];
       INFO['descriptionAbstract'] = inParams['descriptionAbstract'];
       INFO['artifactEvent'] = inParams['artifactEvent'];
       INFO['artifactOrganization'] = inParams['artifactOrganization'];
       INFO['artifactPerson'] = inParams['artifactPerson'];
       INFO['scanner'] = inParams['scanner'];
       INFO['year'] = inParams['year'];

       xml_template = ScannedItem( INFO );
  } else if ( INFO['resourceType'] == 'Oral History' ) {

       INFO['additional'] = inParams['additional'];
       INFO['faculty'] = inParams['faculty'];
       INFO['interviewDate'] = inParams['interviewDate'];
       INFO['interviewLocation'] = inParams['interviewLocation'];
       INFO['interviewee'] = inParams['interviewee'];
       INFO['organizationsInterview'] = inParams['organizationsInterview'];
       INFO['peopleInterview'] = inParams['peopleInterview'];
       INFO['placesInterview'] = inParams['placesInterview'];
       INFO['recorderMake'] = inParams['recorderMake'];
       INFO['year'] = inParams['year'];
        
       xml_template = OralHistory( INFO );
  } else if ( INFO['resourceType'] == 'Sound Recording' ) {

       INFO['additional'] = inParams['additional'];
       INFO['recorderMake'] = inParams['recorderMake'];
       INFO['recordingEvent'] = inParams['recordingEvent'];
       INFO['recordingLocation'] = inParams['recordingLocation'];
       INFO['recordingOrganization'] = inParams['recordingOrganization'];
       INFO['recordingPeople'] = inParams['recordingPeople'];
       INFO['year'] = inParams['year'];

       xml_template = SoundRecording( INFO );
  }
 
 return xml_template;
}


function DigitalPhoto( PARAMS ) {

    var xml_out = '<?xml version="1.0" encoding="UTF-8"?>';
        xml_out += '<Session>';
        xml_out += '<Step>' + PARAMS['step'] + '</Step>';

        xml_out += '<Attachments>';
        if ( PARAMS['attachId'] != '' && PARAMS['fileSize'] != '' && PARAMS['filename'] != '' ) {
             xml_out += '<Attachment id="' + PARAMS['attachId'] + '">';
             xml_out += '<file_size>' + PARAMS['fileSize'] + '</file_size>';
             xml_out += '<original_filename>' + PARAMS['filename'] + '</original_filename>';
             xml_out += '</Attachment>';
        }
        xml_out += '</Attachments>';

        xml_out += '<Formdata>';
        // xml_out += '<_count_faculty-multiple_facultys>1</_count_faculty-multiple_facultys>';
        // xml_out += '<_count_keyword-multiple_keywords>2</_count_keyword-multiple_keywords>';
        //xml_out += '<additional_info>' + PARAMS['additional'] + '</additional_info>';  /* added */
        xml_out += '<camera_info>' + PARAMS['camera'] + '</camera_info>'; /* added */
        // xml_out += '<comments>test Comments</comments>';
        xml_out += '<creator_first_name>' + PARAMS['firstname'] + '</creator_first_name>';
        xml_out += '<creator_last_name>' + PARAMS['lastname'] + '</creator_last_name>';
        xml_out += '<donor_first_name>' + PARAMS['uploaderfname'] + '</donor_first_name>';
        xml_out += '<donor_last_name>' + PARAMS['uploaderlname'] + '</donor_last_name>';

        xml_out += '<description_abstract>'+ PARAMS['additional']+'</description_abstract>';/*added*/ 
        xml_out += '<event>' + PARAMS['events'] + '</event>'; /* added */
        // xml_out += '<faculty>Main Branch</faculty>';
        xml_out += '<donor_email>'+PARAMS['email']+'</donor_email>';
        // xml_out += '<keyword_1>keyword2</keyword_1>';
        // xml_out += '<keyword_2>keyword3</keyword_2>';
        // xml_out += '<keyword_1>keyword2</keyword_1>';
        xml_out += '<language>' + PARAMS['lang'] + '</language>';
        // xml_out += '<notes>test note</notes>'; 
        xml_out += '<organization>' + PARAMS['organization'] + '</organization>';     /* added */
        xml_out += '<persons>' + PARAMS['persons'] + '</persons>';                 /* added */
        xml_out += '<photo_location>' + PARAMS['photoLocation'] + '</photo_location>';  /* added */
        // xml_out += '<research_unit>Adult</research_unit>'; 
        xml_out += '<resource_type>' + PARAMS['resourceType'] + '</resource_type>';
        xml_out += '<rights>' + PARAMS['right'] + '</rights>';
        // xml_out += '<subject>&#13;Photograph &#13;History &#13;Great Depression &#13;</subject>'; 
        // xml_out += '<subject>test Artifact</subject>';
        xml_out += '<title>' + PARAMS['title'] + '</title>';
        xml_out += '<year>' + PARAMS['year'] + '</year>';  /* added */
        xml_out += '<relsext>' + 'No membership' + '</relsext>';
        xml_out += '<SubmissionDate>' + PARAMS['submitDate'] + '</SubmissionDate>';
        xml_out += '</Formdata>';
        xml_out += '</Session>';

 return xml_out;
}

function ScannedItem( PARAMS ) {

    var xml_out = '<?xml version="1.0" encoding="UTF-8"?>';
        xml_out += '<Session>';
        xml_out += '<Step>' + PARAMS['step'] + '</Step>';

        xml_out += '<Attachments>';
        if ( PARAMS['attachId'] != '' && PARAMS['fileSize'] != '' && PARAMS['filename'] != '' ) {
             xml_out += '<Attachment id="' + PARAMS['attachId'] + '">';
             xml_out += '<file_size>' + PARAMS['fileSize'] + '</file_size>';
             xml_out += '<original_filename>' + PARAMS['filename'] + '</original_filename>';
             xml_out += '</Attachment>';
        }
        xml_out += '</Attachments>';

        xml_out += '<Formdata>';
        xml_out += '<scannedLocation>' + PARAMS['scannedLocation'] + '</scannedLocation>';
        xml_out += '<measurements>' + PARAMS['measurements'] + '</measurements>';
        // xml_out += '<_count_keyword-multiple_keywords>1</_count_keyword-multiple_keywords>';
        xml_out += '<additional_info>' + PARAMS['descriptionAbstract'] + '</additional_info>';      /* added */
        xml_out += '<artifact_event>' + PARAMS['artifactEvent'] + '</artifact_event>'; /* added */
        xml_out += '<artifact_organization>' + PARAMS['artifactOrganization'] + '</artifact_organization>'; /* added */
        xml_out += '<artifact_person>' + PARAMS['artifactPerson'] + '</artifact_person>'; /* added */
        // xml_out += '<comments>test Comments&#13;</comments>';
        xml_out += '<creator_first_name>' + PARAMS['firstname'] + '</creator_first_name>';
        xml_out += '<creator_last_name>' + PARAMS['lastname'] + '</creator_last_name>';
        xml_out += '<donor_first_name>' + PARAMS['uploaderfname'] + '</donor_first_name>';
        xml_out += '<donor_last_name>' + PARAMS['uploaderlname'] + '</donor_last_name>';

        xml_out += '<description_abstract>'+ PARAMS['additional']+'</description_abstract>';/*added*/
        xml_out += '<donor_email>'+PARAMS['email']+'</donor_email>';
	// xml_out += '<description_abstract>test desc</description_abstract>';
        // xml_out += '<faculty>Jackson Heights</faculty>';
        // xml_out += '<keyword>keyword1</keyword>';
        // xml_out += '<keyword_1>keyword2</keyword_1>';
        xml_out += '<language>' + PARAMS['lang'] + '</language>';
        // xml_out += '<notes>test note</notes>';
        // xml_out += '<research_unit>Young Adult</research_unit>';
        xml_out += '<resource_type>' + PARAMS['resourceType'] + '</resource_type>';
        xml_out += '<rights>' + PARAMS['right'] + '</rights>';
        xml_out += '<scanner>' + PARAMS['scanner'] +'</scanner>'; /* added */
        // xml_out += '<subject>Abolition &#13;Home Life &#13;&#13;</subject>';
        // xml_out += '<subject>test Artifact</subject>';
        xml_out += '<title>' + PARAMS['title'] + '</title>';
        xml_out += '<year>' + PARAMS['year'] + '</year>';  /* added */
        xml_out += '<relsext>' + 'No membership' + '</relsext>';
        xml_out += '<SubmissionDate>' + PARAMS['submitDate'] + '</SubmissionDate>';
        xml_out += '</Formdata>';
        xml_out += '</Session>';

 return xml_out;
}

/*
function OralHistory( PARAMS ) {

    var xml_out = '<?xml version="1.0" encoding="UTF-8"?>';
        xml_out += '<Session>';
        xml_out += '<Step>' + PARAMS['step'] + '</Step>';

        xml_out += '<Attachments>';
        if ( PARAMS['attachId'] != '' && PARAMS['fileSize'] != '' && PARAMS['filename'] != '' ) {
             xml_out += '<Attachment id="' + PARAMS['attachId'] + '">';
             xml_out += '<file_size>' + PARAMS['fileSize'] + '</file_size>';
             xml_out += '<original_filename>' + PARAMS['filename'] + '</original_filename>';
             xml_out += '</Attachment>';
        }
        xml_out += '</Attachments>';

        xml_out += '<Formdata>';
        xml_out += '<creator_first_name>' + PARAMS['firstname'] + '</creator_first_name>';
        xml_out += '<creator_last_name>' + PARAMS['lastname'] + '</creator_last_name>';
        xml_out += '<language>' + PARAMS['lang'] + '</language>';
        xml_out += '<resource_type>' + PARAMS['resourceType'] + '</resource_type>';
        xml_out += '<rights>' + PARAMS['right'] + '</rights>';
        xml_out += '<title>' + PARAMS['title'] + '</title>';
        xml_out += '<relsext>' + 'No membership' + '</relsext>';
        xml_out += '<SubmissionDate>' + PARAMS['submitDate'] + '</SubmissionDate>';
        xml_out += '</Formdata>';
        xml_out += '</Session>';
 
 return xml_out;
}
*/

function OralHistory( PARAMS ) {

    var xml_out = '<?xml version="1.0" encoding="UTF-8"?>';
        xml_out += '<Session>';
        xml_out += '<Step>' + PARAMS['step'] + '</Step>';

        xml_out += '<Attachments>';
        if ( PARAMS['attachId'] != '' && PARAMS['fileSize'] != '' && PARAMS['filename'] != '' ) {
             xml_out += '<Attachment id="' + PARAMS['attachId'] + '">';
             xml_out += '<file_size>' + PARAMS['fileSize'] + '</file_size>';
             xml_out += '<original_filename>' + PARAMS['filename'] + '</original_filename>';
             xml_out += '</Attachment>';
        }
        xml_out += '</Attachments>';

        xml_out += '<Formdata>';
        //xml_out += '<additional_info>' + PARAMS['additional'] + '</additional_info>'; /* added */
        // xml_out += '<comments>Comments</comments>';
        xml_out += '<creator_first_name>' + PARAMS['firstname'] + '</creator_first_name>';
        xml_out += '<creator_last_name>' + PARAMS['lastname'] + '</creator_last_name>';
        xml_out += '<donor_first_name>' + PARAMS['uploaderfname'] + '</donor_first_name>';
        xml_out += '<donor_last_name>' + PARAMS['uploaderlname'] + '</donor_last_name>';
       
 	xml_out += '<description_abstract>'+ PARAMS['additional']+'</description_abstract>';/*added*/
        // xml_out += '<description_abstract>test4567 description</description_abstract>';
        xml_out += '<faculty>' + PARAMS['faculty'] + '</faculty>'; /* added */
        xml_out += '<interview_date>' + PARAMS['interviewDate'] + '</interview_date>'; /* added */
        xml_out += '<interview_location>' + PARAMS['interviewLocation'] + '</interview_location>'; /* added */
        xml_out += '<interviewee>' + PARAMS['interviewee'] + '</interviewee>'; /* added */
       // xml_out += '<interviewee_date>'+ PARAMS['interviewee_date']+'</interviewee_date>';
        // xml_out += '<keyword>test4567 keyword</keyword>';
        xml_out += '<donor_email>'+PARAMS['email']+'</donor_email>';
        xml_out += '<language>' + PARAMS['lang'] + '</language>';

        xml_out += '<organizations_interview>' + PARAMS['organizationsInterview'] + '</organizations_interview>'; /* added */
        xml_out += '<people_interview>' + PARAMS['peopleInterview'] + '</people_interview>'; /* added */
        xml_out += '<places_interview>' + PARAMS['placesInterview'] + '</places_interview>';  /* added */
        xml_out += '<recorder_make>' + PARAMS['recorderMake'] + '</recorder_make>'; /* added */
        // xml_out += '<research_unit>Young Adult</research_unit>';

        xml_out += '<resource_type>' + PARAMS['resourceType'] + '</resource_type>';
        xml_out += '<rights>' + PARAMS['right'] + '</rights>';

        // xml_out += '<subject>Adults &#13;</subject>';
        // xml_out += '<time_period>Time-period-discussed</time_period>';

        xml_out += '<title>' + PARAMS['title'] + '</title>';
        xml_out += '<year>' + PARAMS['year'] + '</year>';  /* added test */
        xml_out += '<relsext>' + 'No membership' + '</relsext>';
        xml_out += '<SubmissionDate>' + PARAMS['submitDate'] + '</SubmissionDate>';
        xml_out += '</Formdata>';
        xml_out += '</Session> ';

 return xml_out;
}
function SoundRecording( PARAMS ) {
 
    var xml_out = '<?xml version="1.0" encoding="UTF-8"?>';
        xml_out += '<Session>'; 
        xml_out += '<Step>' + PARAMS['step'] + '</Step>';
        xml_out += '<Attachments>';
 if ( PARAMS['attachId'] != '' && PARAMS['fileSize'] != '' && PARAMS['filename'] != '' ) {
             xml_out += '<Attachment id="' + PARAMS['attachId'] + '">';
             xml_out += '<file_size>' + PARAMS['fileSize'] + '</file_size>';
             xml_out += '<original_filename>' + PARAMS['filename'] + '</original_filename>';
             xml_out += '</Attachment>';
        }
        xml_out += '</Attachments>';

        xml_out += '<Formdata>';
        // xml_out += '<_count_keyword-multiple_keywords>1</_count_keyword-multiple_keywords>';
        //xml_out += '<additional_info>' + PARAMS['additional'] + '</additional_info>'; /* added */
        // xml_out += '<comments>test ccc</comments>';
        xml_out += '<creator_first_name>' + PARAMS['firstname'] + '</creator_first_name>';
        xml_out += '<creator_last_name>' + PARAMS['lastname'] + '</creator_last_name>';
        xml_out += '<donor_first_name>' + PARAMS['uploaderfname'] + '</donor_first_name>';
        xml_out += '<donor_last_name>' + PARAMS['uploaderlname'] + '</donor_last_name>';

	xml_out += '<description_abstract>'+ PARAMS['additional']+'</description_abstract>';/*added*/
        xml_out += '<donor_email>'+PARAMS['email']+'</donor_email>';
        // xml_out += '<description_abstract>test desc</description_abstract>';
        // xml_out += '<faculty>Main Branch</faculty>';
        // xml_out += '<journal_title>internet</journal_title>';
        // xml_out += '<keyword>keyword1</keyword>';
        // xml_out += '<keyword_1>keyword2</keyword_1>';
        xml_out += '<language>' + PARAMS['lang'] + '</language>';
        // xml_out += '<notes>test note</notes>';
        xml_out += '<recorder_make>' + PARAMS['recorderMake'] + '</recorder_make>'; /* added */
        xml_out += '<recording_event>' + PARAMS['recordingEvent'] + '</recording_event>'; /* added */
        xml_out += '<recording_location>' + PARAMS['recordingLocation'] + '</recording_location>'; /* added */
        xml_out += '<recording_organization>' + PARAMS['recordingOrganization'] + '</recording_organization>'; /* added */
        xml_out += '<recording_people>' + PARAMS['recordingPeople'] + '</recording_people>'; /* added */
        // xml_out += '<research_unit>Young Adult</research_unit>';
        xml_out += '<resource_type>' + PARAMS['resourceType'] + '</resource_type>';
        xml_out += '<rights>' + PARAMS['right'] + '</rights>';
        // xml_out += '<subject>Children &#13;Adults &#13;</subject>';
        xml_out += '<title>' + PARAMS['title'] + '</title>';
        xml_out += '<year>' + PARAMS['year'] + '</year>'; /* added */
        xml_out += '<relsext>' + 'No membership' + '</relsext>';
        xml_out += '<SubmissionDate>' + PARAMS['submitDate'] + '</SubmissionDate>';
        xml_out += '</Formdata>';
        xml_out += '</Session>';

 return xml_out;
}
