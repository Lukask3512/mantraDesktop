package com.sygic.example.hello3dwiw;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Dialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Resources;
import android.graphics.Color;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.media.JetPlayer;
import android.nfc.Tag;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.util.Log;
import android.util.TypedValue;
import android.view.ActionMode;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.widget.Toolbar;


import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.android.material.textfield.TextInputEditText;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.EventListener;
import com.google.firebase.firestore.FieldValue;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import com.google.firebase.firestore.QuerySnapshot;
import com.google.firebase.storage.FirebaseStorage;
import com.google.firebase.storage.StorageReference;
import com.google.firebase.storage.UploadTask;
import com.google.gson.internal.bind.ObjectTypeAdapter;
import com.sygic.aura.ResourceManager;
import com.sygic.aura.embedded.IApiCallback;
import com.sygic.aura.feature.gps.LocationService;
import com.sygic.aura.utils.PermissionsUtils;
import com.sygic.example.hello3dwiw.Models.Route;
import com.sygic.sdk.api.Api;
import com.sygic.sdk.api.ApiCallback;
import com.sygic.sdk.api.ApiNavigation;
import com.sygic.sdk.api.events.ApiEvents;
import com.sygic.sdk.api.exception.GeneralException;
import com.sygic.sdk.api.model.WayPoint;

import org.jetbrains.annotations.NotNull;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.ActionMenuView;
import androidx.core.app.ActivityCompat;
import androidx.recyclerview.widget.RecyclerView;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;


//treba tu urobit mocny refaktor
public class MainActivity extends AppCompatActivity implements AdapterView.OnItemSelectedListener {
    public static final String LOG_TAG = "hello3dwiw";

    private SygicNaviFragment fgm;
    private Api mApi;

    FirebaseFirestore db = FirebaseFirestore.getInstance();
    private static FirebaseStorage storage = FirebaseStorage.getInstance();

    private Button mLogoutBtn;

    private int previousItemInSpinner = 0;

    FusedLocationProviderClient fusedLocationProviderClient;

    private String carId;
    private static String routeId;
    public static String readRouteId;
    public Object routeInfo;
    public Object routeInfoLon;
    public Object routeInfoLat;
    public Object routeInfoType;
    public Object routeInfoStatus;
    public Object routeInfoAbout;

    //routeLog
    public Object routeLogLat;
    public Object routeLogLon;
    public Object routeLogPlace;
    public Object routeLogState;
    public Object routeLogTimestamp;
    private Object routeLog;
    private Object routeLogId;
    public Object routeLogType;

    //car
    private double carLattitude;
    private double carLongtitude;

    Object oldRoutes;

    public int actualIndexInArray;
    public Spinner spino;
    public boolean townsLayoutOpen;
    private Handler handler;
    private boolean popUpPoPoZmene = false;

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu, menu);
        return super.onCreateOptionsMenu(menu);
    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
            //ked to bolo nizsie bugol mi toolbar ...


        setContentView(R.layout.activity_main);
        handler = new Handler();
        actualIndexInArray = -1;
        checkOnlineMobile();

        if (PermissionsUtils.requestStartupPermissions(this) == PackageManager.PERMISSION_GRANTED) {
            checkSygicResources();
        }

        spino = (Spinner) findViewById(R.id.static_spinner );

        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(
                this, R.array.stateArray, R.layout.spinner_item);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spino.setAdapter(adapter);


        spino.setOnItemSelectedListener(this);

        townsLayoutOpen = true;
        Intent intent = getIntent();
        carId = intent.getExtras().getString("carId");

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(this);
        if (ActivityCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            getLocation();
        } else {
            ActivityCompat.requestPermissions(MainActivity.this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, 44);
        }


        if (intent.getExtras() != null && intent.getExtras().getString("routeId") != null && !intent.getExtras().getString("routeId").equals("null")) {

            routeId = intent.getExtras().getString("routeId");
            getRouteLog();
            readRouteId = routeId;


            DocumentReference docRef = db.collection("route").document(routeId);

            docRef.addSnapshotListener(new EventListener<DocumentSnapshot>() {
                @Override
                public void onEvent(@Nullable DocumentSnapshot doc,
                                    @Nullable FirebaseFirestoreException e) {
                    if (e != null) {
                        Log.w("TAG", "Listen failed.", e);
                        return;
                    }

                    //aby po prihlaseni hned po prihlaseni nevyskocila sprava, ale az po zmene



                    List<String> cities = new ArrayList<>();
//                        for (QueryDocumentSnapshot doc : value) {
                    LinearLayout linearLayout = (LinearLayout) findViewById(R.id.townsArray);

                    linearLayout.removeAllViews();


                    routeInfo = null;
                    routeInfoLat = null;
                    routeInfoLon = null;
                    routeInfoType = null;
                    routeInfoAbout = null;

                    routeInfo = doc.getData().get("nameOfTowns");
                    routeInfoLat = doc.getData().get("coordinatesOfTownsLat");
                    routeInfoLon = doc.getData().get("coordinatesOfTownsLon");
                    routeInfoType = doc.getData().get("type");
                    routeInfoStatus = doc.getData().get("status");
                    routeInfoAbout = doc.getData().get("aboutRoute");

                    if (oldRoutes != null && !oldRoutes.toString().equals(routeInfo.toString())){
                        if (popUpPoPoZmene){
                            AlertDialog.Builder builder = new AlertDialog.Builder(MainActivity.this);

                            builder.setCancelable(true);
                            builder.setTitle("Zmena cesty");
                            builder.setMessage("Vaša cesta bola upravená");

                            builder.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialog, int which) {
                                    dialog.cancel();
                                }
                            });
                            builder.show();
                        }
                    }
                    oldRoutes =  doc.getData().get("nameOfTowns");

                    popUpPoPoZmene = true;


                    final TextView[] myTextViews = new TextView[((ArrayList<?>) routeInfo).size()];

                    for (int i = 0; i < ((ArrayList<?>) routeInfo).size(); i++) {
                        // create a new textview
                        final TextView rowTextView = new TextView(MainActivity.this);

                        // set some properties of rowTextView or something
                        rowTextView.setText((String) ((ArrayList<?>) routeInfo).get(i));
                        rowTextView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 30f);
//                                rowTextView.setBackground(getResources().getDrawable(R.drawable.border));
                        rowTextView.setBackgroundResource(R.drawable.border);
                        if (((ArrayList<Long>) routeInfoStatus).get(i) == 3) {
                            rowTextView.setBackgroundColor(Color.parseColor("#00FF00"));
                        }
                        if (((ArrayList<Long>) routeInfoStatus).get(i) == 4){
                            rowTextView.setBackgroundColor(Color.parseColor("#ff5e5e"));
                        }
                        // add the textview to the linearlayout
                        linearLayout.addView(rowTextView);

                        rowTextView.setId(i);
                        final int finalI = i;
                        rowTextView.setOnClickListener(new View.OnClickListener() {

                            public void onClick(View v) {

                                final String str = rowTextView.getText().toString();
                                AlertDialog.Builder builder = new AlertDialog.Builder(MainActivity.this);

                                builder.setCancelable(true);
                                builder.setTitle("Navigácia");
                                builder.setMessage("Chcete spustiť navigovanie na adresu: " + str);

                                actualIndexInArray = finalI;

                                builder.setNegativeButton("Nie", new DialogInterface.OnClickListener() {
                                    @Override
                                    public void onClick(DialogInterface dialog, int which) {
                                        dialog.cancel();
                                    }
                                });
                                builder.setPositiveButton("Áno", new DialogInterface.OnClickListener() {
                                    @Override
                                    public void onClick(DialogInterface dialog, int which) {
                                        if (finalI > 0) {
                                            int id = finalI - 1;
                                            TextView finished = (TextView) findViewById(id);

                                            if (((ArrayList<String>) routeInfoType).get(finalI - 1).equals("nakladka") &&
                                                    (
                                                            Integer.parseInt((((ArrayList<?>) routeInfoStatus).get(finalI - 1)).toString()) == 2)) {

                                                                if (actualIndexInArray >= 0) {
                                                                    finished.setBackgroundColor(Color.parseColor("#00FF00"));
                                                                    ((ArrayList<Number>) routeInfoStatus).set(finalI - 1, 3);
                                                                    Map<String, Object> data = new HashMap<>();
                                                                    //
                                                                    data.put("status", routeInfoStatus);
                                                                    db.collection("route").document(routeId)
                                                                            .update(data);
                                                                }

                                            } else if (((ArrayList<String>) routeInfoType).get(finalI - 1).equals("vykladka") &&
                                                    (
                                                                    Integer.parseInt((((ArrayList<?>) routeInfoStatus).get(finalI - 1)).toString()) == 2)){

                                                                if (actualIndexInArray >= 0) {
                                                                    ((ArrayList<Number>) routeInfoStatus).set(finalI - 1, 3);
                                                                    Map<String, Object> data = new HashMap<>();
                                                                    //
                                                                    data.put("status", routeInfoStatus);
                                                                    db.collection("route").document(routeId)
                                                                            .update(data);
                                                                }
                                            }
                                        }

                                        changeSpinnerValue(1);
                                        updateRouteLog(actualIndexInArray,1);

                                        townsLayoutOpen = false;
                                        changeLayoutSize();
                                        findIndexOfTown(finalI);

                                    }
                                });
                                builder.show();
                            }
                        });

                        // save a reference to the textview for later
                        myTextViews[i] = rowTextView;
                    }
                    Button button = new Button(MainActivity.this);
                    button.setText("Dokoncit");
                    button.setBackgroundColor(Color.parseColor("#00FF00"));
                    button.setOnClickListener(new View.OnClickListener() {

                        public void onClick(View v) {

                            allertFinish();
//                            allertOnAllRouteDone();
                        }
                    });
                    linearLayout.addView(button);
                }
            });

        }

        Button button = (Button) findViewById(R.id.button2);
        button.setOnClickListener(new View.OnClickListener(){
            @Override
            //On click function
            public void onClick(View view) {
                Intent intent = new Intent(MainActivity.this, LoginPage.class);

                Map<String, Object> data = new HashMap<>();
                data.put("status", -2);

                if (carId != null) {
                    db.collection("cars").document(carId)
                            .update(data);
                    carId = null;
                    routeId = null;
                }
                startActivity(intent);
                finish();

            }
        });

        Button buttonRoutes = (Button) findViewById(R.id.toRoutes);
        buttonRoutes.setOnClickListener(new View.OnClickListener(){
            @Override
            //On click function
            public void onClick(View view) {
                Intent intent = new Intent(MainActivity.this, ChooseRoute.class);
                intent.putExtra("carId", carId);
                startActivity(intent);
                routeId = null;
                readRouteId = null;
                finish();

            }
        });

        ImageButton imageButton = (ImageButton) findViewById(R.id.buttonInfo);
        imageButton.setOnClickListener(new View.OnClickListener(){
            @Override
            //On click function
            public void onClick(View view) {
                if (routeId != null && actualIndexInArray >= 0 && actualIndexInArray <= ((ArrayList<?>) routeInfoAbout).size()) {
                    AlertDialog.Builder builder = new AlertDialog.Builder(MainActivity.this);

                    builder.setCancelable(true);
                    String typ = ((ArrayList<?>) routeInfoType).get(actualIndexInArray).toString();
                    if (typ.equals("nakladka")){
                        builder.setTitle("Nakládka");

                    }else{
                        builder.setTitle("Vykládka");
                    }
                    String vypis = ((ArrayList<?>) routeInfoAbout).get(actualIndexInArray).toString();
                    Log.e("NavigationTime2", "co to bude"+ vypis);
                    if (vypis.equals("")){
                        builder.setMessage("Žiadne informácie k dispozícii");
                    }else{
                        builder.setMessage(vypis);
                    }

                    builder.setNegativeButton("Ok", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.cancel();
                        }
                    });
                    builder.show();
                }else{
                        Toast.makeText(MainActivity.this, "No route selected", Toast.LENGTH_LONG).show();
                }
            }
        });

        ImageButton nextRouteButton = (ImageButton) findViewById(R.id.nextRoute);
        nextRouteButton.setOnClickListener(new View.OnClickListener(){
            @Override
            //On click function
            public void onClick(View view) {
                if (routeId != null){
                    allertNextNavigation(true, false);
                }else {
                    Toast.makeText(MainActivity.this, "No route selected", Toast.LENGTH_LONG).show();
                }
            }
        });





    }
    private void changeLayoutSize(){
        if (townsLayoutOpen){
            LinearLayout linearLayout = (LinearLayout) findViewById(R.id.townsWrapper);
            linearLayout.getLayoutParams().height = 400;
            linearLayout.requestLayout();
        }
        else{
            LinearLayout linearLayout = (LinearLayout) findViewById(R.id.townsWrapper);
            linearLayout.getLayoutParams().height = 0;
            linearLayout.requestLayout();

        }

    }

    public static void sendRoute(){
        if (routeId != null){
            if (!routeId.equals("null")){

                String status = null;
                String json = null;
                try {

                    json = ApiNavigation.getRoute(1, 0, 0);
                    JSONObject jsonObject = new JSONObject(json);
                    JSONObject jsonArray = (JSONObject) jsonObject.get("polygon");
                    JSONObject jsonFinish = (JSONObject) jsonArray.get("lineString");
                    JSONArray jsonFinish2 = (JSONArray) jsonFinish.get("points");

                    Log.e("NavigationTime2", "co to bude"+ jsonFinish);

                    //ukladam textak do databazy s trasou
                    StorageReference storageRef = storage.getReference();
                    StorageReference mountainsRef = storageRef.child("Routes");
                    mountainsRef.child(routeId + ".json").putBytes(jsonFinish2.toString().getBytes()).addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception exception) {
                            // Handle unsuccessful uploads
                        }
                    }).addOnSuccessListener(new OnSuccessListener<UploadTask.TaskSnapshot>() {
                        @Override
                        public void onSuccess(UploadTask.TaskSnapshot taskSnapshot) {
                            // taskSnapshot.getMetadata() contains file metadata such as size, content-type, etc.
                            // ...
                        }
                    });

                } catch (GeneralException | JSONException e) {
                    e.printStackTrace();
                }

            }}
    }

    void demo()
    {
        Timer timer = new Timer();
        TimerTask doAsynch = new TimerTask() {
            @SuppressLint("MissingPermission")
            @Override
            public void run() {
                if (routeId != null) {
                    if (!routeId.equals("null")) {

                        String status = null;
                        String json = null;
                        try {

                            status = ApiNavigation.getRouteStatus(0);
                            ParseRouteStatus(status);

                            json = ApiNavigation.getRoute(1, 0, 0);
                            JSONObject jsonObject = new JSONObject(json);
                            JSONObject jsonArray = (JSONObject) jsonObject.get("polygon");
                            JSONObject jsonFinish = (JSONObject) jsonArray.get("lineString");
                            JSONArray jsonFinish2 = (JSONArray) jsonFinish.get("points");


//                    File file = new File(this.getFilesDir(), "file-nameName");
//                    FileReader fileReader = null;
//                    FileWriter fileWriter = null;
//                    BufferedReader bufferedReader = null;
//                    BufferedWriter bufferedWriter = null;
//                    String response = null;
//                    if(!file.exists()){
//                        file.createNewFile();
//                        fileWriter = new FileWriter(file.getAbsoluteFile());
//                        bufferedWriter = new BufferedWriter(fileWriter);
//                        bufferedWriter.write("'" + jsonFinish2.toString() + "'"); // si vkladam uvodzovky pre json format
//                        bufferedWriter.close();
//
//                    }
//                    String skuska = "'" + jsonFinish.toString() + "'";
                            Log.e("NavigationTime2", "co to bude" + jsonFinish);

//                    //ukladam textak do databazy s trasou
//                    StorageReference storageRef = storage.getReference();
//                    StorageReference mountainsRef = storageRef.child("Routes");
//                    mountainsRef.child(routeId + ".json").putBytes(jsonFinish2.toString().getBytes()).addOnFailureListener(new OnFailureListener() {
//                        @Override
//                        public void onFailure(@NonNull Exception exception) {
//                            // Handle unsuccessful uploads
//                        }
//                    }).addOnSuccessListener(new OnSuccessListener<UploadTask.TaskSnapshot>() {
//                        @Override
//                        public void onSuccess(UploadTask.TaskSnapshot taskSnapshot) {
//                            // taskSnapshot.getMetadata() contains file metadata such as size, content-type, etc.
//                            // ...
//                        }
//                    });

                        } catch (GeneralException | JSONException e) {
                            e.printStackTrace();
                        }

                    }
                }
            }
        };
        timer.schedule(doAsynch, 0, 60000);

    }

    protected String ParseRouteStatus(String statusFromRoute) {
        try {
            JSONObject jout = new JSONObject(statusFromRoute);
            String n1 = jout.getString("numVisited");
            String n2 = jout.getString("numUnvisited");
            String n3 = jout.getString("numPredictedLateArrivals");
            String n4 = jout.getString("numPredictedEarlyArrivals");
            JSONArray jArr = jout.getJSONArray("waypoints");
            String eta = "n/a";
//            String output = "visited/unvisited/early/late:" + n1 + "/" + n2 + "/" + n3 + "/" + n4 + "\n";
            for (int i = 0; i < jArr.length(); i++) {
                JSONObject obj = jArr.getJSONObject(i);
//                String waypointId = obj.getString("waypointId");              // retrieve waypoint id
                JSONObject rts = obj.getJSONObject("realtimeStatus");
                String status = rts.getString("status");                      // retrieve status
//                String eta = "n/a";
                int drem = -1;
                int trem = -1;
                if (status.compareTo("unvisited") == 0) {
                    eta = rts.getString("estimatedTimeArrival");     // retrieve eta to the waypoint
                    drem = rts.getInt("distanceRemaining");          // retrieve remaining distance in meters
                    trem = rts.getInt("timeRemaining");              // retrieve remaining time in seconds
                    Log.e("NavigationTime", "Error code:"+ eta + " " + trem);
                }
//                output += "waypointId=" + waypointId + ",";
//                output += "status=" + status + "\n";
//                output += "eta=" + eta + "\n";
//                output += "distanceRemaining=" + String.valueOf(drem) + "\n";
//                output += "timeRemaining=" + String.valueOf(trem) + "\n";
            }
            Log.e("NavigationTime", "Error code:"+ eta);

            Map<String, Object> data = new HashMap<>();
            data.put("estimatedTimeArrival", eta);
            db.collection("route").document(routeId)
                    .update(data);

            return eta;

        }
        catch(JSONException e){
                e.printStackTrace();
            }
            return null;

    }




    private void findIndexOfTown(final int town){

                final double lattitude =  (double)((ArrayList<Double>) routeInfoLat).get(town);
                final double longtitude = (double)((ArrayList<Double>) routeInfoLon).get(town);
                final int townForThread = town;

                new Thread() {
                    public void run() {
                        try {

                            int flags = 0;
                            boolean searchAddress = false;
                            int lat =(int)(lattitude * 100000);
                            int lon = (int)( longtitude * 100000);
                            WayPoint wp = new WayPoint("A", lon, lat);
                            //ak to nejde treba zadat licenciu v appke / chybu vypise v logcate

                            ApiNavigation.startNavigation(wp, flags, searchAddress, 0);
                            final TextView textView = (TextView) findViewById(R.id.textView4);
                            runOnUiThread(new Runnable() {

                                @Override
                                public void run() {
                                    String town = (String) ((ArrayList<?>) routeInfo).get(townForThread);
                                    //vykladka  / nakladka
                                    String type = (String) ((ArrayList<?>) routeInfoType).get(townForThread);
                                    // Stuff that updates the UI
                                    textView.setText(town + ": " + type);
                                    demo();

                                }
                            });




                        } catch (GeneralException e) {
                            e.printStackTrace();
                            Log.e("Navigation", "Error code:"+ e);

                            runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    Toast.makeText(MainActivity.this, "Enter valid license or download correct maps.", Toast.LENGTH_LONG).show();
                                }
                            });
                        }
                    }
                }.start();
//                break;
//            }
//        }
    }

    private void changeRouteStatus(int id){
        ((ArrayList<Number>) routeInfoStatus).set(actualIndexInArray, id);
        Map<String, Object> data = new HashMap<>();
        data.put("status", routeInfoStatus);
        db.collection("route").document(routeId)
                .update(data);

        changeCarStatus(id);
    }

    private void changeCarStatus(int id){
        Map<String, Object> data = new HashMap<>();
        data.put("status", id);
        db.collection("cars").document(carId)
                .update(data);
    }

    //zmeni stav spinnera spinner values su v res/
    private void changeSpinnerValue(final int id) {
        if (routeId != null){
            changeRouteStatus(id);
        }

        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                spino.setSelection(id);
            }
        });
    }

    private void getLocation() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        Timer timer = new Timer();
        TimerTask doAsynch = new TimerTask() {
            @SuppressLint("MissingPermission")
            @Override
            public void run() {

                fusedLocationProviderClient.getLastLocation().addOnCompleteListener(new OnCompleteListener<Location>() {
                    @Override
                    public void onComplete(@NonNull @NotNull Task<Location> task) {
                        Location location = task.getResult();
                        if (location != null) {
                            Geocoder geocoder = new Geocoder(MainActivity.this, Locale.getDefault());
                            try {
                                List<Address> addresses = geocoder.getFromLocation(
                                        location.getLatitude(), location.getLongitude(), 1);
                                Log.e("Error", "" + addresses.get(0).getLatitude());

                                sendLocationToFire(addresses.get(0).getLatitude(), addresses.get(0).getLongitude());
                                carLattitude = addresses.get(0).getLatitude();
                                carLongtitude = addresses.get(0).getLongitude();
                            } catch (IOException e) {
                                e.printStackTrace();
                                Log.e("Error", "se porantalo" + e);
                            }
                        }
                    }
                });
            }
        };
        //tu sa nastavi ako casto sa bude nacitavat lokacia do premennej
        timer.schedule(doAsynch, 0, 4000);

    }
//
//
    private void sendLocationToFire(double lat, double lon){
        if (carId != null){
            Map<String, Object> data = new HashMap<>();
            data.put("lattitude", lat);
            data.put("longtitude", lon);
            db.collection("cars").document(carId).update(data);
            if (routeId != null ){
                if (!routeId.equals("null")){

                    final Handler handler = new Handler();
                    handler.postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            // Do something after 5s = 5000ms
//                            demo();

                        }
                    }, 5000);
                }
            }

        }


    }

    private void checkSygicResources() {
        ResourceManager resourceManager = new ResourceManager(this, null);
        if(resourceManager.shouldUpdateResources()) {
            Toast.makeText(this, "Please wait while Sygic resources are being updated", Toast.LENGTH_LONG).show();
            resourceManager.updateResources(new ResourceManager.OnResultListener() {
                @Override
                public void onError(int errorCode, @NotNull String message) {
                    Toast.makeText(MainActivity.this, "Failed to update resources: " + message, Toast.LENGTH_LONG).show();
                    finish();
                }

                @Override
                public void onSuccess() {
                    initUI();
                }
            });
        }
        else {
            initUI();
        }
    }
//
    private void initUI() {
        setContentView(R.layout.activity_main);
        fgm = new SygicNaviFragment();
        getSupportFragmentManager().beginTransaction().replace(R.id.sygicmap, fgm).commitAllowingStateLoss();

        ImageButton btn = (ImageButton) findViewById(R.id.button1);
        btn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                townsLayoutOpen = !townsLayoutOpen;
                changeLayoutSize();

            }
        });

    }
//
//
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        for(int res : grantResults) {
            if(res != PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(this, "You have to allow all permissions", Toast.LENGTH_LONG).show();
                finish();
                return;
            }
        }

        // all permissions are granted
        checkSygicResources();
    }



    @Override
    protected Dialog onCreateDialog(int id) {
        Dialog dlg = fgm.onCreateDialog(id);
        if (dlg == null)
            return super.onCreateDialog(id);
        return dlg;
    }

    @Override
    protected void onPrepareDialog(int id, Dialog dialog) {
        super.onPrepareDialog(id, dialog);
        fgm.onPrepareDialog(id, dialog);
    }
//
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        fgm.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
        if (routeLogId != null && actualIndexInArray != -1 && routeId != null){
            updateRouteLog(actualIndexInArray, position);
        }
        Resources res = getResources();
        String[] items = res.getStringArray(R.array.stateArray);
        Toast.makeText(this, items[position], Toast.LENGTH_LONG).show();
        changeCarStatus(position);
        if (routeId != null){
            if (actualIndexInArray >= 0 ){
            if (previousItemInSpinner != 3){
                changeRouteStatus(position);
                }



            if(actualIndexInArray+1 == ((ArrayList<Number>) routeInfoStatus).size() && (position == 3) ){
                allertFinish();
            }
        }
            if (position == 3){
                deleteRoute();
            }else{
                sendRoute();
            }

        if (actualIndexInArray+1 < ((ArrayList<Number>) routeInfoStatus).size() && (position == 3)){

            allertNextNavigation(false, true);
        }
        previousItemInSpinner = position;

        }

    }

    @Override
    public void onNothingSelected(AdapterView<?> parent) {

    }

//    @Override
//    protected void onStop() {
//
//        super.onStop();
//
//    }

    private void allertFinish(){
        AlertDialog.Builder builder = new AlertDialog.Builder(MainActivity.this);

        builder.setCancelable(true);
        builder.setTitle("Navigácia");
        builder.setMessage("Chcete dokoncit danu trasu?");

        builder.setNegativeButton("Nie", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {

                dialog.cancel();
            }
        });
        builder.setPositiveButton("Áno", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                actualIndexInArray++;
                final TextView textView = (TextView) findViewById(R.id.textView4);
                runOnUiThread(new Runnable() {

                    @Override
                    public void run() {
                        textView.setText("");

                    }
                });
                try {
                    ApiNavigation.stopNavigation(0);
                } catch (GeneralException e) {
                    e.printStackTrace();
                }
                if (actualIndexInArray > 0 && previousItemInSpinner != 3) {
                    allertOnPreviousPoint(true);
                }
                else{
                    allertOnAllRouteDone();
                }

                Long tsLong = System.currentTimeMillis() / 1000;
                Map<String, Object> data = new HashMap<>();
                data.put("finished", true);
                data.put("finishedAt", tsLong.toString());
                db.collection("route").document(routeId)
                        .update(data);
//                routeId = null;

                LinearLayout linearLayout = (LinearLayout) findViewById(R.id.townsArray);
                linearLayout.setVisibility(View.INVISIBLE);


            }
        });
        builder.show();
    }

    private void allertNextNavigation(final boolean askPrevious, final boolean goNextWithouAsking){
        Log.d("wata", "DocumentSnapshot written with ID: " + actualIndexInArray);
        if(actualIndexInArray+1 >= ((ArrayList<Number>) routeInfoStatus).size()){
            allertFinish();
            Log.d("wata2", "DocumentSnapshot written with ID: " + actualIndexInArray);

        }else {


            AlertDialog.Builder builder = new AlertDialog.Builder(MainActivity.this);

            builder.setCancelable(true);
            builder.setTitle("Navigácia");
            builder.setMessage("Chcete spustit navigaciu na nasledujucu adresu - " + ((ArrayList<String>) routeInfo).get(actualIndexInArray + 1) + "?");

            builder.setNegativeButton("Nie", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    dialog.cancel();
                }
            });
            builder.setPositiveButton("Áno", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialog, int which) {
                    actualIndexInArray++;
                    Log.d("wata", "DocumentSnapshot written with ID: " + actualIndexInArray);
                    if (actualIndexInArray == 0){
                        findIndexOfTown(actualIndexInArray);
                    }

//                    findIndexOfTown(actualIndexInArray);
                    runOnUiThread(new Runnable() {

                        @Override
                        public void run() {

//                            spino.setSelection(1);
                    changeSpinnerValue(1);

                        }
                    });

                    if (askPrevious && actualIndexInArray > 0) {
                        allertOnPreviousPoint(false);
                    }
                    if (goNextWithouAsking){
                        findIndexOfTown(actualIndexInArray);
                    }




                }
            });
            builder.show();
        }
    }

    //ked chce dokoncit trasu tak sa ho opyta na vsetky mesta - ci uspesne nalozil/ vylozil
    private void allertOnAllRouteDone(){
        final ArrayList selectedItems = new ArrayList();  // Where we track the selected items

        AlertDialog.Builder builder = new AlertDialog.Builder(MainActivity.this);

        builder.setCancelable(false);
        builder.setTitle("Tieto miesta boli úspešne naložené / vyložené?");
//        builder.setMessage("Chcete spustit navigaciu na nasledujucu adresu?");

        ArrayList<String> animals = (ArrayList<String>) routeInfo;
//        String[] animals = {"vylozeny", "nalozeny", "problem", "preskocit"};
        String [] arrayToList = new String[animals.size()];
        arrayToList = animals.toArray(arrayToList);
        boolean[] checkedItems = new boolean[arrayToList.length];

        for (int i =0; i < ((ArrayList<String>) routeInfo).size(); i++){
            if (Integer.parseInt((((ArrayList<?>) routeInfoStatus).get(i)).toString()) == 3){
                checkedItems[i] = true;
                selectedItems.add(i);
            }
        }

        builder.setMultiChoiceItems(arrayToList, checkedItems, new DialogInterface.OnMultiChoiceClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which,
                                boolean isChecked) {
                if (isChecked) {
                    // If the user checked the item, add it to the selected items
                    selectedItems.add(which);
                } else if (selectedItems.contains(which)) {
                    // Else, if the item is already in the array, remove it
                    selectedItems.remove(Integer.valueOf(which));
                }
            }
        });

        builder.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
//                Log.w("TAGix", selectedItems.toString());


                for (int i =0; i < ((ArrayList<String>) routeInfo).size(); i++){
                    for (int j = 0; j < selectedItems.size(); j++){
                        if ((Integer) selectedItems.get(j) == i){
                            ((ArrayList<Integer>) routeInfoStatus).set(i, 3);
                            break;
                        }else{
                            ((ArrayList<Integer>) routeInfoStatus).set(i, 4);
                        }
                    }
//
                }
                Log.w("TAGix", routeInfoStatus.toString());

                deleteRoute();
                Map<String, Object> data = new HashMap<>();
                //
                data.put("status", routeInfoStatus);
                db.collection("route").document(routeId)
                        .update(data);

                routeId = null;

            }
        });
        builder.show();
    }

    private void allertOnPreviousPoint(final boolean last){
        AlertDialog.Builder builder = new AlertDialog.Builder(MainActivity.this);

        builder.setCancelable(false);
        builder.setTitle("Predchadzajuce miesto: " + ((ArrayList<String>) routeInfo).get(actualIndexInArray -1));
//        builder.setMessage("Chcete spustit navigaciu na nasledujucu adresu?");

        String[] animals = {"naložený / vyložený",  "problém", "preskocit"};
//        String[] animals = {"vylozeny", "nalozeny", "problem", "preskocit"};

        boolean[] checkedItems = {true, false, false, false};
        builder.setSingleChoiceItems(animals, 0, null);

//        builder.setNegativeButton("Nie", new DialogInterface.OnClickListener() {
//            @Override
//            public void onClick(DialogInterface dialog, int which) {
//                dialog.cancel();
//            }
//        });

        builder.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                ((ArrayList<Number>) routeInfoStatus).set(actualIndexInArray - 1, 1);
                int selectedPosition = ((AlertDialog)dialog).getListView().getCheckedItemPosition();
                if (selectedPosition == 0){
                    ((ArrayList<Number>) routeInfoStatus).set(actualIndexInArray -1, 3);
                    updateRouteLog(actualIndexInArray -1, 3);
                }else if(selectedPosition == 1){
                    ((ArrayList<Number>) routeInfoStatus).set(actualIndexInArray -1, 4);
                    updateRouteLog(actualIndexInArray -1, 4);
                }
                else if(selectedPosition == 2){
                    ((ArrayList<Number>) routeInfoStatus).set(actualIndexInArray -1, -1);
                    updateRouteLog(actualIndexInArray -1, -1);
                }

                Map<String, Object> data = new HashMap<>();
                //
                data.put("status", routeInfoStatus);
                db.collection("route").document(routeId)
                        .update(data);

                if (last){
                    allertOnAllRouteDone();
                }else{
                    findIndexOfTown(actualIndexInArray);
                    updateRouteLog(actualIndexInArray, 1);
                }


            }
        });
        builder.show();
    }

    private void createRouteLog(){
        // Add a new document with a generated id.
        Map<String, Object> data = new HashMap<>();
        data.put("routeId", routeId);
        db.collection("routeLog")
                .add(data)
                .addOnSuccessListener(new OnSuccessListener<DocumentReference>() {
                    @Override
                    public void onSuccess(DocumentReference documentReference) {
                        Log.d("TAG", "DocumentSnapshot written with ID: " + documentReference.getId());
                        routeLogId = documentReference.getId();
                    }
                })
                .addOnFailureListener(new OnFailureListener() {
                    @Override
                    public void onFailure(@NonNull Exception e) {
                        Log.w("TAG", "Error adding document", e);
                    }
                });
    }

    private void updateRouteLog(int place, long state){
        Long tsLong = System.currentTimeMillis();
        String ts = tsLong.toString();
        if (routeLogPlace == null){
            routeLogPlace = new ArrayList<String>();
            routeLogState = new ArrayList<Integer>();
            routeLogTimestamp = new ArrayList<String>();
            routeLogLat = new ArrayList<Integer>();
            routeLogLon = new ArrayList<Integer>();
            routeLogType = new ArrayList<String>();
        }
        String town = ((ArrayList<String>) routeInfo).get(place);
        String type = ((ArrayList<String>) routeInfoType).get(place);
        if (type.equals("nakladka")){
            type = "nakládka";
        }else{
            type = "vykládka";
        }


//        Log.d("TAGg", "DocumentSnapshot successfully updated1!" + ((ArrayList<String>) routeLogPlace).get(((ArrayList<String>) routeLogPlace).size() - 1));
//        Log.d("TAGg", "DocumentSnapshot successfully updated2!" + town);
//        Log.d("TAGg", "DocumentSnapshot successfully updated1!" + ((ArrayList<Integer>) routeLogState).get(((ArrayList<Integer>) routeLogState).size() -1));
//        Log.d("TAGg", "DocumentSnapshot successfully updated2!" + state);

        if (((ArrayList<String>) routeLogPlace).size() == 0){
            ((ArrayList<String>) routeLogPlace).add(town);
            ((ArrayList<Long>) routeLogState).add(state);
            ((ArrayList<String>) routeLogTimestamp).add(ts);
            ((ArrayList<Double>) routeLogLat).add(carLattitude);
            ((ArrayList<Double>) routeLogLon).add(carLongtitude);
            ((ArrayList<String>) routeLogType).add(type);

            // Add a new document with a generated id.
            Map<String, Object> data = new HashMap<>();
            data.put("lattitude",routeLogLat);
            data.put("longtitude", routeLogLon);
            data.put("place", routeLogPlace);
            data.put("timestamp", routeLogTimestamp);
            data.put("state", routeLogState);
            data.put("type", routeLogType);
            db.collection("routeLog")
                    .document(routeLogId.toString()).update(data)
                    .addOnSuccessListener(new OnSuccessListener<Void>() {
                        @Override
                        public void onSuccess(Void aVoid) {
                            Log.d("TAG", "DocumentSnapshot successfully updated!");
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            Log.w("TAG", "Error updating document", e);
                        }
                    });
        }

        //nepridavat 2 rovnake veci za sebou / napr pri odhlaseni a potom pokracovani v danej trase
        else if (!((ArrayList<String>) routeLogPlace).get(((ArrayList<String>) routeLogPlace).size() - 1).equals(town)
        || (Long)((ArrayList<Long>) routeLogState).get(((ArrayList<Long>) routeLogState).size() - 1) !=  state){

            ((ArrayList<String>) routeLogPlace).add(town);
            ((ArrayList<Long>) routeLogState).add(state);
            ((ArrayList<String>) routeLogTimestamp).add(ts);
            ((ArrayList<Double>) routeLogLat).add(carLattitude);
            ((ArrayList<Double>) routeLogLon).add(carLongtitude);
            if (type != null && routeLogType != null){
                ((ArrayList<String>) routeLogType).add(type);
            }

            // Add a new document with a generated id.
            Map<String, Object> data = new HashMap<>();
            data.put("lattitude",routeLogLat);
            data.put("longtitude", routeLogLon);
            data.put("place", routeLogPlace);
            data.put("timestamp", routeLogTimestamp);
            data.put("state", routeLogState);
            data.put("type", routeLogType);
            db.collection("routeLog")
                    .document(routeLogId.toString()).update(data)
                    .addOnSuccessListener(new OnSuccessListener<Void>() {
                        @Override
                        public void onSuccess(Void aVoid) {
                            Log.d("TAG", "DocumentSnapshot successfully updated!");
                        }
                    })
                    .addOnFailureListener(new OnFailureListener() {
                        @Override
                        public void onFailure(@NonNull Exception e) {
                            Log.w("TAG", "Error updating document", e);
                        }
                    });
        }


    }


    private void getRouteLog(){
        db.collection("routeLog")
                .whereEqualTo("routeId", routeId)
                .get()
                .addOnCompleteListener(new OnCompleteListener<QuerySnapshot>() {

                    @Override
                    public void onComplete(@NonNull Task<QuerySnapshot> task) {
                        if (task.isSuccessful()) {
                            if (task.getResult().size() > 0){
                                for (QueryDocumentSnapshot document : task.getResult()) {
                                    routeLog = document.getData();
                                    routeLogPlace = document.getData().get("place");
                                    routeLogLat = document.getData().get("lattitude");
                                    routeLogLon = document.getData().get("longtitude");
                                    routeLogTimestamp = document.getData().get("timestamp");
                                    routeLogState = document.getData().get("state");
                                    routeLogId = document.getId();
                                }
                        }else{
                                Log.d("TAG1", "neexist");
                                createRouteLog();
                            }
                        } else {
                            Log.d("TAG1", "Error getting documents: ", task.getException());
                        }
                    }
                });

    }

    private void checkOnlineMobile(){
        Log.w("TAGix", LoginPage.carIdDoc);
        db.collection("cars").document(LoginPage.carIdDoc)
                .addSnapshotListener(new EventListener<DocumentSnapshot>() {
                    @Override
                    public void onEvent(@Nullable DocumentSnapshot snapshot,
                                        @Nullable FirebaseFirestoreException e) {
                        if (e != null) {
                            Log.w("TAG", "Listen failed.", e);
                            return;
                        }

                        String source = snapshot != null && snapshot.getMetadata().hasPendingWrites()
                                ? "Local" : "Server";

                        if (snapshot != null && snapshot.exists()) {
                            Log.d("TAG", source + " data: " + snapshot.getData());
                            String fireIdMob = new String(snapshot.getData().get("phoneId").toString());
                            if (!fireIdMob.equals(LoginPage.mobileid.toString())) {

                                AlertDialog.Builder builder = new AlertDialog.Builder(MainActivity.this);

                                builder.setCancelable(false);
                                builder.setTitle("Boli ste odlhaseny!!");
                                builder.setMessage("Vasim telefonym cislom sa prihlasil iny pouzivatel");

                                carId = null;
                                routeId = null;

                                builder.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
                                    @Override
                                    public void onClick(DialogInterface dialog, int which) {


                                        Intent intent = new Intent(MainActivity.this, LoginPage.class);
                                        startActivity(intent);
                                        finish();

                                    }
                                });
                                builder.show();

                            }


                        } else {
                            Log.d("TAG", source + " data: null");
                        }
                    }
                });
    }
    //vymaze cestu z databazy storage - ked
    private void deleteRoute(){

        StorageReference storageRef = storage.getReference();

        StorageReference desertRef = storageRef.child("Routes/" + routeId + ".json");

        desertRef.delete().addOnSuccessListener(new OnSuccessListener<Void>() {
            @Override
            public void onSuccess(Void aVoid) {
                // File deleted successfully
            }
        }).addOnFailureListener(new OnFailureListener() {
            @Override
            public void onFailure(@NonNull Exception exception) {
                // Uh-oh, an error occurred!
            }
        });
    }

    @Override
    public void onBackPressed() {
        Intent intent = new Intent(MainActivity.this, ChooseRoute.class);
        intent.putExtra("carId", carId);
        startActivity(intent);
        routeId = null;
        readRouteId = null;
        finish();
    }

}
