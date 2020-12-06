package com.sygic.example.hello3dwiw;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Dialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.Resources;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.media.JetPlayer;
import android.os.Build;
import android.os.Bundle;
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
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import com.google.firebase.firestore.QuerySnapshot;
import com.google.gson.internal.bind.ObjectTypeAdapter;
import com.sygic.aura.ResourceManager;
import com.sygic.aura.feature.gps.LocationService;
import com.sygic.aura.utils.PermissionsUtils;
import com.sygic.example.hello3dwiw.Models.Route;
import com.sygic.sdk.api.ApiNavigation;
import com.sygic.sdk.api.exception.GeneralException;
import com.sygic.sdk.api.model.WayPoint;

import org.jetbrains.annotations.NotNull;
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

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;

public class MainActivity extends AppCompatActivity implements AdapterView.OnItemSelectedListener {
    public static final String LOG_TAG = "hello3dwiw";

    private SygicNaviFragment fgm;

    FirebaseFirestore db = FirebaseFirestore.getInstance();
    private Button mLogoutBtn;

    FusedLocationProviderClient fusedLocationProviderClient;

    private String carId;
    public Object routeInfo;
    public Object routeInfoLon;
    public Object routeInfoLat;
    public String[] routeInfo2;
    public Spinner spino;
    public boolean townsLayoutOpen;

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
//        Toolbar toolbar = (Toolbar) findViewById(R.id.myToolBar);
//        setSupportActionBar(toolbar);
        if (PermissionsUtils.requestStartupPermissions(this) == PackageManager.PERMISSION_GRANTED) {
            checkSygicResources();
        }

        spino = (Spinner) findViewById(R.id.static_spinner );

        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(
                this, R.array.stateArray, android.R.layout.simple_spinner_item);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spino.setAdapter(adapter);


        spino.setOnItemSelectedListener(this);


        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        fusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(this);
        if (ActivityCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            getLocation();
        } else {
            ActivityCompat.requestPermissions(MainActivity.this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, 44);
        }
        townsLayoutOpen = true;
        Intent intent = getIntent();
        carId = intent.getExtras().getString("carId");
        Log.d("TAG", "aweweaewaewaewae." + carId);

        db.collection("route")
                .whereEqualTo("carId", carId)
                .addSnapshotListener(new EventListener<QuerySnapshot>() {
                    @Override
                    public void onEvent(@Nullable QuerySnapshot value,
                                        @Nullable FirebaseFirestoreException e) {
                        if (e != null) {
                            Log.w("TAG", "Listen failed.", e);
                            return;
                        }

                        List<String> cities = new ArrayList<>();
                        for (QueryDocumentSnapshot doc : value) {
                            LinearLayout linearLayout = (LinearLayout) findViewById(R.id.townsArray);

                            linearLayout.removeAllViews();
                           routeInfo = null;
                            routeInfoLat = null;
                            routeInfoLon = null;

                                Log.d("TAG", "Current cites in CA2: " + doc.getData().get("nameOfTowns"));
                                Log.d("TAG", "Current cites in CA2: " + doc.getData().get("coordinatesOfTownsLat"));
                                Log.d("TAG", "Current cites in CA2: " + doc.getData().get("coordinatesOfTownsLon"));
                                routeInfo = doc.getData().get("nameOfTowns");
                            routeInfoLat = doc.getData().get("coordinatesOfTownsLat");
                            routeInfoLon = doc.getData().get("coordinatesOfTownsLon");

                            Log.d("TAG", "Hovno " + routeInfo);


                            final TextView[] myTextViews = new TextView[((ArrayList<?>) routeInfo).size()];

                            for (int i = 0; i < ((ArrayList<?>) routeInfo).size(); i++) {
                                // create a new textview
                                final TextView rowTextView = new TextView(MainActivity.this);

                                // set some properties of rowTextView or something
                                rowTextView.setText((String)((ArrayList<?>) routeInfo).get(i));
                                rowTextView.setTextSize(TypedValue.COMPLEX_UNIT_SP,30f);
//                                rowTextView.setBackground(getResources().getDrawable(R.drawable.border));
                                rowTextView.setBackgroundResource(R.drawable.border);
                                // add the textview to the linearlayout
                                linearLayout.addView(rowTextView);

                                rowTextView.setId(i);
                                rowTextView.setOnClickListener(new View.OnClickListener() {

                                    public void onClick(View v) {

                                        final String str = rowTextView.getText().toString();
//
//                                        Log.d("TAG", "wuhuuu: " + str);
//                                        findIndexOfTown(str);
//                                        Intent intent = new Intent(MainActivity.this, Popup.class);
//                                        intent.putExtra("town", str);
//                                        startActivityForResult(intent,1);
                                        AlertDialog.Builder builder = new AlertDialog.Builder(MainActivity.this);

                                        builder.setCancelable(true);
                                        builder.setTitle("Navigácia");
                                        builder.setMessage("Chcete spustiť navigovanie na adresu: " + str);

                                        builder.setNegativeButton("Nie", new DialogInterface.OnClickListener() {
                                            @Override
                                            public void onClick(DialogInterface dialog, int which) {
                                                dialog.cancel();
                                            }
                                        });
                                        builder.setPositiveButton("Áno", new DialogInterface.OnClickListener() {
                                            @Override
                                            public void onClick(DialogInterface dialog, int which) {
                                                townsLayoutOpen = false;
                                                changeLayoutSize();
                                                findIndexOfTown(str);
                                            }
                                        });
                                        builder.show();
                                    }
                                });

                                // save a reference to the textview for later
                                myTextViews[i] = rowTextView;
                            }

                            Log.d("TAG", "Current cites in CA: " + doc.getData());
                        }

                    }
                });



        Button button = (Button) findViewById(R.id.button2);
        button.setOnClickListener(new View.OnClickListener(){
            @Override
            //On click function
            public void onClick(View view) {
                carId = null;
                Intent intent = new Intent(MainActivity.this, LoginPage.class);
                startActivity(intent);
                finish();

            }
        });



    }
    private void changeLayoutSize(){
        Button button = (Button) findViewById(R.id.button1);

        if (townsLayoutOpen){
            LinearLayout linearLayout = (LinearLayout) findViewById(R.id.townsWrapper);
            linearLayout.getLayoutParams().height = 300;
            linearLayout.requestLayout();
            button.setText("Zmenšiť");
        }
        else{
            LinearLayout linearLayout = (LinearLayout) findViewById(R.id.townsWrapper);
            linearLayout.getLayoutParams().height = 0;
            linearLayout.requestLayout();
            button.setText("Zväčšiť");

        }

    }



    private void findIndexOfTown(final String town){
        Log.e("PRO","Navigujem" + town);
        for (int i = 0; i < ((ArrayList<?>) routeInfo).size(); i++){
            if (((ArrayList<?>) routeInfo).get(i) == town){
                Log.e("PRO","crash to" + ((ArrayList<?>) routeInfoLat).get(i));
                final double lattitude =  (double)((ArrayList<?>) routeInfoLat).get(i);
                final double longtitude = (double)((ArrayList<?>) routeInfoLon).get(i);
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


                            TextView textView = (TextView) findViewById(R.id.textView4);
                            textView.setText(town);
                            spino.post(new Runnable() {
                                @Override
                                public void run() {
                                    spino.setSelection(1);
                                }
                            });
                        } catch (GeneralException e) {
                            e.printStackTrace();
                            Log.e("Navigation", "Error code:"+ e);
                        }
                    }
                }.start();
                break;
            }
        }
    }
//
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
                            } catch (IOException e) {
                                e.printStackTrace();
                                Log.e("Error", "se porantalo" + e);
                            }
                        }
                    }
                });
            }
        };
        //tu sa nastavi ako casto sa bude odosielat lokacia
        timer.schedule(doAsynch, 0, 50000);

    }
//
//
    private void sendLocationToFire(double lat, double lon){
        Map<String, Object> data = new HashMap<>();
        data.put("lattitude", lat);
        data.put("longtitude", lon);
        db.collection("cars").document(carId)
                .update(data);
        //len ak by sme chceli odchytavat ci to fakt doslo na firebase ...
//                .addOnSuccessListener(new OnSuccessListener<DocumentReference>() {
//                    @Override
//                    public void onSuccess(DocumentReference documentReference) {
//                        Log.d("TAG", "DocumentSnapshot added with ID: " + documentReference.getId());
//                    }
//                })
//                .addOnFailureListener(new OnFailureListener() {
//                    @Override
//                    public void onFailure(@NonNull Exception e) {
//                        Log.w("TAG", "Error adding document", e);
//                    }
//                });
    }
//
//
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

//        final EditText address = (EditText)findViewById(R.id.edit1);

        Button btn = (Button) findViewById(R.id.button1);
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
//        String dataTown = (String)data.getBundleExtra("town");
//        if (){
//
//        }
        super.onActivityResult(requestCode, resultCode, data);
        fgm.onActivityResult(requestCode, resultCode, data);
    }
//
    @Override
    public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
        Resources res = getResources();
        String[] items = res.getStringArray(R.array.stateArray);
        Toast.makeText(this, "Array" + items[position], Toast.LENGTH_LONG).show();

        Map<String, Object> data = new HashMap<>();
        data.put("status", items[position]);
        db.collection("cars").document(carId)
                .update(data);

    }

    @Override
    public void onNothingSelected(AdapterView<?> parent) {

    }

//    @Override
//    protected void onStart() {
//        super.onStart();
//        if(mCurrentUser == null){
//            sendUserToLogin();
//        }
//    }

//    private void sendUserToLogin() {
//        Intent loginIntent = new Intent(MainActivity.this, LoginActivity.class);
//        loginIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
//        loginIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK);
//        startActivity(loginIntent);
//        finish();
//    }

}
