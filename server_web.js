var datetime = require('node-datetime');
var express = require('express');
var fs = require("fs");
var multer = require('multer');

var app = express();

app.post('/api/v1/valets',function(req,res){

    var dt = datetime.create();
    var filename = "valet-" + dt.format('Ymd-HMS');
    var attach_file = 'APItemp00000-' + dt.format('HMS');

    var storage =   multer.diskStorage({
      destination: function (req, file, callback) {
        callback( null, '/opt/vtls/valet/qmp/storage/stage1/' );
      },
      filename: function (req, file, callback) {
        callback( null, attach_file );
      }
    });
    var upload = multer({ storage : storage}).single('userPhoto');

    // console.log( res );


    upload( req , res , function(err) {
    
        // console.log( res.req );
        
        var injectParams = new Array();

        injectParams['attachId'] = attach_file;
        injectParams['fileSize'] = res.req.file.size;
        injectParams['filename'] = res.req.file.originalname;

        injectParams['resourceType'] = res.req.body.resourceType;
        injectParams['step'] = res.req.body.step;
        injectParams['email']=res.req.body.email;

        injectParams['firstname'] = res.req.body.firstname;
        injectParams['lastname'] = res.req.body.lastname;
        injectParams['uploaderfname'] = res.req.body.uploaderfname;
        injectParams['uploaderlname'] = res.req.body.uploaderlname;
        injectParams['lang'] = res.req.body.lang;

        injectParams['right'] = 'Contact digitalarchives@queenslibrary.org for research and reproduction requests. This material may be protected by the U.S. Copyright Law (Title 17,U.S.C.). We welcome you to make fair use of the content accessible on this website as defined by copyright law. Please note that you are responsible for determining whether your use is fair and for responding to any claims that may arise from your use.';

        injectParams['title'] = res.req.body.title;
        injectParams['memberType'] = res.req.body.memberType;

        injectParams['submitDate'] = dt.format('Y-m0d-H:M:S');

        /* Separate param by resourceType */ 
        if ( injectParams['resourceType'] == 'Digital Photograph' ) {

             injectParams['additional'] = res.req.body.additional;
             injectParams['camera'] = res.req.body.camera;
             injectParams['events'] = res.req.body.events;
             injectParams['organization'] = res.req.body.organization;
             injectParams['persons'] = res.req.body.persons;
             injectParams['photoLocation'] = res.req.body.photoLocation;
             injectParams['year'] = res.req.body.year;
       
        } else if ( injectParams['resourceType'] == 'Scanned Material' ) {
             injectParams['scannedLocation'] = res.req.body.scannedLocation;
             injectParams['measurements']=res.req.body.measurements;
             injectParams['additional'] = res.req.body.additional;
             injectParams['descriptionAbstract'] = res.req.body.descriptionAbstract;
             injectParams['artifactEvent'] = res.req.body.artifactEvent;
             injectParams['artifactOrganization'] = res.req.body.artifactOrganization;
             injectParams['artifactPerson'] = res.req.body.artifactPerson;
             injectParams['scanner'] = res.req.body.scanner;
             injectParams['year'] = res.req.body.year;
       
        } else if ( injectParams['resourceType'] == 'Oral History' ) {

             injectParams['additional'] = res.req.body.additional;
             injectParams['faculty'] = res.req.body.faculty;
             injectParams['interviewDate'] = 'Date Recorded: '+res.req.body.interviewDate;
             injectParams['interviewLocation'] = 'Location Recorded: '+res.req.body.interviewLocation;
             injectParams['interviewee'] = res.req.body.interviewee;
             injectParams['organizationsInterview'] = res.req.body.organizationsInterview;
             injectParams['peopleInterview'] = res.req.body.peopleInterview;
             injectParams['placesInterview'] = res.req.body.placesInterview;
             injectParams['recorderMake'] = res.req.body.recorderMake; 
             injectParams['year'] = res.req.body.year; 
        
        } else if ( injectParams['resourceType'] == 'Sound Recording' ) {

             injectParams['additional'] = res.req.body.additional;
             injectParams['recorderMake'] = res.req.body.recorderMake;  // Yes or No 
             injectParams['recordingEvent'] = res.req.body.recordingEvent;
             injectParams['recordingLocation'] = res.req.body.recordingLocation;
             injectParams['recordingOrganization'] = res.req.body.recordingOrganization;
             injectParams['recordingPeople'] = res.req.body.recordingPeople;
             injectParams['year'] = res.req.body.year;

        } 

 
        if(err) {
            // attach_file = '';
            return res.end("Error uploading file.\n\n");
        }

        // console.log( attach_file + '|' +  fileSize + '|' +  fileName );
        
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
                return res.end( msg );
           }
        }); 

    });

});

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

var server = app.listen( 8082, function () {

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
//        xml_out += '<additional_info>' + PARAMS['additional'] + '</additional_info>';  /* added */
        xml_out += '<camera_info>' + PARAMS['camera'] + '</camera_info>'; /* added */
        // xml_out += '<comments>test Comments</comments>';
        xml_out += '<creator_first_name>' + PARAMS['firstname'] + '</creator_first_name>';
        xml_out += '<creator_last_name>' + PARAMS['lastname'] + '</creator_last_name>';
        xml_out += '<donor_first_name>' + PARAMS['uploaderfname'] + '</donor_first_name>';
        xml_out += '<donor_last_name>' + PARAMS['uploaderlname'] + '</donor_last_name>';
        xml_out += '<description_abstract>' + PARAMS['additional'] + '</description_abstract>'; /*added*/ 
        xml_out += '<event>' + PARAMS['events'] + '</event>'; /* added */
        xml_out += '<donor_email>'+PARAMS['email']+'</donor_email>';
        // xml_out += '<faculty>Main Branch</faculty>';
        // xml_out += '<keyword>keyword1</keyword>';
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
        xml_out += '<relsext>' + PARAMS['memberType'] + '</relsext>';
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

        xml_out += '<description_abstract>' + PARAMS['additional'] + '</description_abstract>'; /* added */
        xml_out += '<donor_email>'+PARAMS['email']+'</donor_email>';
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
        xml_out += '<relsext>' + PARAMS['memberType'] + '</relsext>';
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
        xml_out += '<relsext>' + PARAMS['memberType'] + '</relsext>';
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
	xml_out += '<description_abstract>' + PARAMS['additional'] + '</description_abstract>'; /*added*/
        // xml_out += '<description_abstract>test4567 description</description_abstract>';
        xml_out += '<faculty>' + PARAMS['faculty'] + '</faculty>'; /* added */
        xml_out += '<interview_date>' + PARAMS['interviewDate'] + '</interview_date>'; /* added */
        xml_out += '<interview_location>' + PARAMS['interviewLocation'] + '</interview_location>'; /* added */
        xml_out += '<interviewee>' + PARAMS['interviewee'] + '</interviewee>'; /* added */
        //xml_out += '<interviewee_date>' + PARAMS['interviewee_date']+ '</interviewee_date>';
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
        xml_out += '<relsext>' + PARAMS['memberType'] + '</relsext>';
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
        xml_out += '<description_abstract>' + PARAMS['additional'] + '</description_abstract>'; /*added*/
	// xml_out += '<description_abstract>test desc</description_abstract>';
        // xml_out += '<faculty>Main Branch</faculty>';
        // xml_out += '<journal_title>internet</journal_title>';
        // xml_out += '<keyword>keyword1</keyword>';
        // xml_out += '<keyword_1>keyword2</keyword_1>';
        xml_out += '<donor_email>'+PARAMS['email']+'</donor_email>';
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
        xml_out += '<relsext>' + PARAMS['memberType'] + '</relsext>';
        xml_out += '<SubmissionDate>' + PARAMS['submitDate'] + '</SubmissionDate>';
        xml_out += '</Formdata>';
        xml_out += '</Session>';

 return xml_out;
}
