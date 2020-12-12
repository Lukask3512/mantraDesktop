package com.sygic.example.hello3dwiw;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.content.res.Resources;
import android.os.Bundle;
import android.text.Editable;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;
import android.widget.Toast;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.android.material.textfield.TextInputEditText;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.QueryDocumentSnapshot;
import com.google.firebase.firestore.QuerySnapshot;

import java.util.HashMap;
import java.util.Map;

public class LoginPage extends AppCompatActivity implements AdapterView.OnItemSelectedListener {

    FirebaseFirestore db = FirebaseFirestore.getInstance();
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login_page);


        Spinner spino = (Spinner) findViewById(R.id.static_spinner );

        spino.setVisibility(View.INVISIBLE);

        Button buttonToRoutes = (Button) findViewById(R.id.toRoutes);
        Button buttonLogout = (Button) findViewById(R.id.button2);

        buttonToRoutes.setVisibility(View.INVISIBLE);
        buttonLogout.setVisibility(View.INVISIBLE);


        Button button = (Button) findViewById(R.id.prihlas);
        button.setOnClickListener(new View.OnClickListener(){
            @Override
            //On click function
            public void onClick(View view) {
                //Create the intent to start another activity
                TextInputEditText textInputEditText = (TextInputEditText) findViewById(R.id.textInput);
                Editable cislo = textInputEditText.getText();
                Log.d("TAG", "cislo" + " => " + cislo);
                db.collection("cars")
                        .whereEqualTo("phoneNumber", cislo.toString())
                        .get()
                        .addOnCompleteListener(new OnCompleteListener<QuerySnapshot>() {
                            @Override
                            public void onComplete(@NonNull Task<QuerySnapshot> task) {
                                if (task.isSuccessful()) {
                                    for (QueryDocumentSnapshot document : task.getResult()) {
                                        Log.d("TAG", document.getId() + " => " + document.getData());
                                        Log.d("TAG", document.getId() + " => " );
                                        Intent intent = new Intent(LoginPage.this, ChooseRoute.class);
                                        intent.putExtra("carId", document.getId());

                                        Map<String, Object> data = new HashMap<>();
                                        data.put("status", "Online");


                                            db.collection("cars").document(document.getId().toString())
                                                    .update(data);


                                        startActivity(intent);
                                    }
                                } else {
                                    Log.d("TAG", "Error getting documents: ", task.getException());
                                    Toast.makeText(getApplicationContext(),"Nesprávne číslo",Toast.LENGTH_SHORT).show();
                                }
                            }
                        });



            }
        });
    }


    @Override
    public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
        Resources res = getResources();
        String[] items = res.getStringArray(R.array.stateArray);
        Toast.makeText(this, "Array" + items[position], Toast.LENGTH_LONG).show();
        Log.e("Error", "" + items[position]);
    }

    @Override
    public void onNothingSelected(AdapterView<?> parent) {
        Resources res = getResources();
        String[] items = res.getStringArray(R.array.stateArray);
        Toast.makeText(this, "Assrray" , Toast.LENGTH_LONG).show();
        Log.e("Error", "" );
    }
}